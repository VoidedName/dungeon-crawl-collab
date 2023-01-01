import { describe, expect, test } from 'vitest';
import { none, some } from '@/utils/Maybe';

describe('maybe tests', () => {
  test('some is some', () => {
    expect(some('test').isSome()).toBeTruthy();
    expect(some('test').isNone()).toBeFalsy();
  });

  test('none is none', () => {
    expect(none().isNone()).toBeTruthy();
    expect(none().isSome()).toBeFalsy();
  });

  test('some has correct get value', () => {
    expect(some('value').get()).toBe('value');
  });

  test('map maps some', () => {
    expect(
      some(7)
        .map(x => x * 2)
        .get()
    ).toBe(14);

    expect(
      some(7)
        .flatMap(x => some(x * 2))
        .getOrElse(() => 77)
    ).toBe(14);

    expect(
      some(7)
        .flatMap(() => none())
        .getOrElse(() => 77)
    ).toBe(77);
  });

  test('none maps nothing', () => {
    expect(
      none<number>()
        .map(x => x * 2)
        .isNone()
    ).toBeTruthy();

    expect(
      none<number>()
        .flatMap(() => some(3))
        .isNone()
    ).toBeTruthy();

    expect(
      none<number>()
        .flatMap(() => none())
        .isNone()
    ).toBeTruthy();
  });

  test('matching some', () => {
    expect(
      some(44).match(
        x => x === 44,
        () => false
      )
    ).toBeTruthy();
  });

  test('matching none', () => {
    expect(
      none().match(
        () => false,
        () => true
      )
    ).toBeTruthy();
  });

  test('orElse on some does nothing', () => {
    expect(
      some(14)
        .orElse(() => 4)
        .get()
    ).toBe(14);
  });

  test('getOrElse on some does nothing', () => {
    expect(some(14).getOrElse(() => 4)).toBe(14);
  });

  test('orElse on none uses else', () => {
    expect(
      none()
        .orElse(() => 4)
        .get()
    ).toBe(4);
  });

  test('getOrElse on none uses else', () => {
    expect(none().getOrElse(() => 4)).toBe(4);
  });
});
