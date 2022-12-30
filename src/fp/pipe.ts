type PipeStep<I, O> = {
  evaluate: (arg: I) => O;
  then: <R>(fn: (arg: O) => R) => PipeStep<I, R>;
};

/**
 * Utility to compose functions in a type safe manner.
 *
 * A pipe can be evaluated safely multiple times and extending a pipe
 * does not mutate the original pipe.
 *
 * @example
 * // constructs a pipe that will compute x => (x*2) + 10
 * let p = pipe(x => x*2).then(x => x + 10)
 * // will evaluate the pipe on 2 and yield 24
 * let x = p.evaluate(2)
 * // extending the pipe is non destructive
 * let p2 = p.then(x => x * x)
 * // will still yield 24
 * x = p.evaluate(2)
 *
 * @param fn
 */
export function pipe<I, O>(fn: (arg: I) => O): PipeStep<I, O> {
  return {
    evaluate: arg => fn(arg),
    then: next => pipe(arg => next(fn(arg)))
  };
}
