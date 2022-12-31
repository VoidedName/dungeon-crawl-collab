import { describe, expect, test } from 'vitest';
import { err, ok } from '@/utils/Result';

describe('result tests', () => {
  test('ok is ok', () => {
    expect(ok('test').isOk()).toBeTruthy();
    expect(ok('test').isErr()).toBeFalsy();
  });

  test('err is err', () => {
    expect(err('error').isErr()).toBeTruthy();
    expect(err('error').isOk()).toBeFalsy();
  });

  test('ok has correct get value', () => {
    expect(ok('value').get()).toBe('value');
  });

  test('map maps ok', () => {
    expect(
      ok(7)
        .map(x => x * 2)
        .get()
    ).toBe(14);

    expect(
      ok(7)
        .flatMap(x => ok(x * 2))
        .getExcept(() => 77)
    ).toBe(14);

    expect(
      ok(7)
        .flatMap(() => err(13))
        .getExcept(x => x)
    ).toBe(13);
  });

  test('err maps nothing', () => {
    expect(
      err<number, any>('test')
        .map(x => x * 2)
        .isErr()
    ).toBeTruthy();

    expect(
      err<number, any>('test')
        .flatMap(() => ok(3))
        .isErr()
    ).toBeTruthy();

    expect(
      err<number, any>('test')
        .flatMap(() => err('value'))
        .isErr()
    ).toBeTruthy();
  });

  test('matching ok', () => {
    expect(
      ok(44).match(
        x => x === 44,
        () => false
      )
    ).toBeTruthy();
  });

  test('matching err', () => {
    expect(
      err(55).match(
        () => false,
        x => x === 55
      )
    ).toBeTruthy();
  });

  test('except on ok does nothing', () => {
    expect(
      ok(14)
        .except(() => 4)
        .get()
    ).toBe(14);
  });

  test('getExcept on ok does nothing', () => {
    expect(ok(14).getExcept(() => 4)).toBe(14);
  });

  test('except on err uses else', () => {
    expect(
      err<number, number>(44)
        .except(() => 4)
        .get()
    ).toBe(4);
  });

  test('getExcept on err uses else', () => {
    expect(err<number, number>(44).getExcept(() => 4)).toBe(4);
  });
});
