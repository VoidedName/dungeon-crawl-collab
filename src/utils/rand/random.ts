// https://en.wikipedia.org/wiki/Lehmer_random_number_generator

export type Random = {
  /**
   * Next integer
   */
  next(): number;
  /**
   * Next Double between [0, 1[
   */
  nextF(): number;
  /**
   * next Double between [min, max[
   */
  nextRange(min: number, max: number): number;
  /**
   * set seed
   */
  seed(seed: number): void;
  /**
   * Next Integer between [1; sides]
   */
  die(sides: number): number;
};

/**
 * seed should be > 0 and < 0x7fffffff
 */
export function lehmerRandom(seed?: number): Random {
  let state = seed ?? Date.now();

  function next(): number {
    state += 0xe120fc15;
    let tmp = state * 0x4a39b70d;
    const m1 = (tmp >> 16) ^ tmp;
    tmp = m1 * 0x12fad5c9;
    return (tmp >> 16) ^ tmp;
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
