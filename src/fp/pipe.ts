type PipeStep<I, O> = {
  evaluate: (arg: I) => O;
  then: <R>(fn: (arg: O) => R) => PipeStep<I, R>;
};

export function pipe<I, O>(fn: (arg: I) => O): PipeStep<I, O> {
  return {
    evaluate: arg => fn(arg),
    then: next => pipe(arg => next(fn(arg)))
  };
}
