import type { Random } from '@/utils/rand/random';

export type RandomTableBuilder<T> = {
  addEntry<E>(
    e: E,
    weight: (scalar: number) => number
  ): RandomTableBuilder<E | T>;
  build(adjustment: number): RandomTable<T>;
};

export type RandomTable<T> = {
  roll(rng: Random): T;
};

function builder<T>(
  rules: [T, (s: number) => number][]
): RandomTableBuilder<T> {
  return {
    addEntry<E>(
      e: E,
      weight: (scalar: number) => number
    ): RandomTableBuilder<E | T> {
      return builder([
        ...(rules as [E | T, (s: number) => number][]),
        [e, weight]
      ]);
    },
    build(adjustment: number): RandomTable<T> {
      const total = rules.reduce((a, [, x]) => a + x(adjustment), 0);

      return {
        roll(rng: Random): T {
          const entry = rng.nextF() * total;
          let sum = 0.0;
          for (const [e, w] of rules) {
            sum += w(adjustment);
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

export function randomTable<T>(
  e: T,
  weight: (scalar: number) => number
): RandomTableBuilder<T> {
  return builder([[e, weight]]);
}
