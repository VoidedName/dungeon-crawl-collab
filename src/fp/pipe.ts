type PipeStep<I, O> = {
  compose: () => (arg: I) => O;
  then: <R>(fn: (arg: O) => R) => PipeStep<I, R>;
};

export function pipe<I, O>(fn: (arg: I) => O): PipeStep<I, O> {
  return {
    compose: () => fn,
    then: next => pipe(arg => next(fn(arg)))
  };
}
