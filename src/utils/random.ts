// https://en.wikipedia.org/wiki/Lehmer_random_number_generator

export type Random = {
  next(): number;
  nextF(): number;
  nextRange(min: number, max: number): number;
  seed(seed: number): void;
  die(sides: number): number;
};

function lcg_parkmiller(state: number) {
  const product = state * 48271;
  let x = (product & 0x7fffffff) + (product >> 31);

  x = (x & 0x7fffffff) + (x >> 31);
  return x;
}

/**
 * seed should be > 0 and < 0x7fffffff
 */
export function lehmerRandom(seed?: number): Random {
  let state = seed ?? Date.now();
  function next(): number {
    state = lcg_parkmiller(state);
    return state;
  }
  function nextF(): number {
    return next() / 0x7fffffff;
  }
  function nextRange(min: number, max: number): number {
    return nextF() * (max - min) + min;
  }
  return {
    next,
    seed(seed: number) {
      state = seed;
    },
    nextF,
    nextRange,
    die(sides: number): number {
      return Math.round(nextRange(1, sides));
    }
  };
}
