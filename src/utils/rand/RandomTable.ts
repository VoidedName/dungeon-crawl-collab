import type { Random } from '@/utils/rand/random';

export type RandomTableBuilder<T> = {
  addEntry<E>(e: E, weight: number): RandomTableBuilder<E | T>;
  build(): RandomTable<T>;
};

export type RandomTable<T> = {
  roll(rng: Random): T;
};

function builder<T>(rules: [T, number][]): RandomTableBuilder<T> {
  return {
    addEntry<E>(e: E, weight: number): RandomTableBuilder<E | T> {
      return builder([...(rules as [E | T, number][]), [e, weight]]);
    },
    build(): RandomTable<T> {
      const total = rules.reduce((a, [, x]) => a + x, 0);

      return {
        roll(rng: Random): T {
          const entry = rng.nextF() * total;
          let sum = 0.0;
          for (const [e, w] of rules) {
            sum += w;
            if (sum <= entry) {
              return e;
            }
          }
          throw rules[rules.length - 1]![0];
        }
      };
    }
  };
}

export function randomTable<T>(e: T, weight: number): RandomTableBuilder<T> {
  return builder([[e, weight]]);
}
