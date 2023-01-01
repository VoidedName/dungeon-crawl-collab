export type Maybe<T> = Some<T> | None<T>;

abstract class AMaybe<T> {
  abstract map<R>(fn: (value: T) => R): Maybe<R>;

  abstract flatMap<R>(fn: (value: T) => Maybe<R>): Maybe<R>;

  abstract match<R>(onSome: (value: T) => R, onNone: () => R): R;

  abstract getOrElse(orElse: () => T): T;

  abstract orElse(orElse: () => T): Some<T>;

  isSome(): this is Some<T> {
    return this instanceof Some;
  }

  isNone(): this is None<T> {
    return this instanceof None;
  }
}

class Some<T> extends AMaybe<T> {
  private readonly value: T;

  constructor(value: T) {
    super();
    this.value = value;
  }

  map<R>(fn: (value: T) => R): Some<R> {
    return some(fn(this.value));
  }

  flatMap<R>(fn: (value: T) => Maybe<R>): Maybe<R> {
    return fn(this.value);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  match<R>(onSome: (value: T) => R, onNone: () => R): R {
    return onSome(this.value);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getOrElse(orElse: () => T): T {
    return this.value;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  orElse(orElse: () => T): Some<T> {
    return this;
  }

  get(): T {
    return this.value;
  }
}

class None<T> extends AMaybe<T> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  map<R>(fn: (value: T) => R): None<R> {
    return this as unknown as None<R>;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  flatMap<R>(fn: (value: T) => Maybe<R>): Maybe<R> {
    return none();
  }

  match<R>(onSome: (value: T) => R, onNone: () => R): R {
    return onNone();
  }

  getOrElse(orElse: () => T): T {
    return orElse();
  }

  orElse(orElse: () => T): Some<T> {
    return some(orElse());
  }
}

export function some<T>(value: T): Some<T> {
  return new Some<T>(value);
}

export function none<T>(): None<T> {
  return new None<T>();
}
