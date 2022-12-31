// eslint-disable-next-line @typescript-eslint/ban-ts-comment
export type Result<T, E> = Ok<T, E> | Err<T, E>;

abstract class AResult<T, E> {
  abstract map<R>(fn: (value: T) => R): Result<R, E>;

  abstract flatMap<R>(fn: (value: T) => Result<R, E>): Result<R, E>;

  abstract match<R>(onOk: (value: T) => R, onErr: (err: E) => R): R;

  abstract getExcept(orErr: (err: E) => T): T;

  abstract except(fn: (err: E) => T): Ok<T, E>;

  abstract flatExcept<Er>(fn: (err: E) => Result<T, Er>): Result<T, Er>;

  isOk(): this is Ok<T, E> {
    return this instanceof Ok;
  }

  isErr(): this is Err<T, E> {
    return this instanceof Err;
  }
}

class Ok<T, E> extends AResult<T, E> {
  private readonly value: T;

  constructor(value: T) {
    super();
    this.value = value;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  except(fn: (err: E) => T): Ok<T, E> {
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getExcept(orErr: (err: E) => T): T {
    return this.value;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  map<R>(fn: (value: T) => R): Ok<R, E> {
    return ok(fn(this.value));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  match<R>(onOk: (value: T) => R, onErr: (err: E) => R): R {
    return onOk(this.value);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  flatExcept<Er>(fn: (err: E) => Result<T, Er>): Ok<T, Er> {
    return this as unknown as Ok<T, Er>;
  }

  flatMap<R>(fn: (value: T) => Result<R, E>): Result<R, E> {
    return fn(this.value);
  }

  get(): T {
    return this.value;
  }
}

class Err<T, E> extends AResult<T, E> {
  private readonly error: E;

  constructor(error: E) {
    super();
    this.error = error;
  }

  except(fn: (err: E) => T): Ok<T, E> {
    return ok(fn(this.error));
  }

  flatExcept<Er>(fn: (err: E) => Result<T, Er>): Result<T, Er> {
    return fn(this.error);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  flatMap<R>(fn: (value: T) => Result<R, E>): Err<R, E> {
    return this as unknown as Err<R, E>;
  }

  getExcept(orErr: (err: E) => T): T {
    return orErr(this.error);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  map<R>(fn: (value: T) => R): Err<R, E> {
    return this as unknown as Err<R, E>;
  }

  match<R>(onOk: (value: T) => R, onErr: (err: E) => R): R {
    return onErr(this.error);
  }
}

export function ok<T, E>(value: T): Ok<T, E> {
  return new Ok<T, E>(value);
}

export function err<T, E>(error: E): Err<T, E> {
  return new Err<T, E>(error);
}
