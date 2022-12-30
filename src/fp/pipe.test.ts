import { describe, expect, test } from 'vitest';
import { pipe } from '@/fp/pipe';

describe('pipe tests', () => {
  test('when supplying id it evaluates as id', () => {
    const sut = pipe(a => a);
    expect(sut.evaluate(1)).toBe(1);
    expect(sut.evaluate('test')).toBe('test');
  });

  test('when supplying simple one stage it evaluates to correct results', () => {
    const sut = pipe((a: number) => a * 2);
    expect(sut.evaluate(1)).toBe(2);
    expect(sut.evaluate(21)).toBe(42);
  });

  test('when chaining it does apply them in order', () => {
    const sut = pipe((a: number) => a * 2)
      .then(a => a + 10)
      .then(a => a / 2);
    expect(sut.evaluate(1)).toBe(6);
    expect(sut.evaluate(21)).toBe(26);
  });

  test('chaining does not mutate the previous step', () => {
    const sut = pipe((a: number) => a * 2)
      .then(a => a + 10)
      .then(a => a / 2);
    sut.then(() => 0);
    expect(sut.evaluate(1)).toBe(6);
    expect(sut.evaluate(21)).toBe(26);
  });
});
