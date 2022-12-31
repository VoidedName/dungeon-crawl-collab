export type Nullable<T> = T | null | undefined;
export type NonNullable<T> = Exclude<T, undefined | null>;
export type PartialBy<T, K extends keyof T = never> = Omit<T, K> &
  Partial<Pick<T, K>>;
export type Entries<T> = { [K in keyof T]: [K, T[K]] }[keyof T];
export type AnyObject = { [key: string]: any };
export type AnyFunction = (...args: any[]) => any;
export type Keys<T> = keyof T;
export type Values<T> = T[keyof T];
export type Override<A, B> = Omit<A, keyof B> & B;
export type Mutable<T> = { -readonly [Key in keyof T]: T[Key] };
export type AsyncReturnType<T extends (...args: any) => Promise<any>> =
  T extends (...args: any) => Promise<infer R> ? R : any;

export type Intersect<X extends any[]> = X extends []
  ? never
  : X extends [head: infer A]
  ? A
  : X extends [head: infer A, ...tail: infer B]
  ? A & Intersect<[...B]>
  : never;

export type Point = { x: number; y: number };
export type Size = { w: number; h: number };
export type Circle = Point & { r: number };
export type Rectangle = Point & Size;
