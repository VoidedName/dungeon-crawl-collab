import type { ECSComponent } from '@/ecs/ECSComponent';
import { describe, expect, test } from 'vitest';
import { ecsComponent, has } from '@/ecs/ECSComponent';

describe('ecs helpers', () => {
  test('type guard is positive when correct', () => {
    const guard = has<ECSComponent<'test'>>('test');
    expect(guard({ entity_id: 1, test: {} })).toBeTruthy();
  });

  test('type guard is negative when wrong', () => {
    const guard = has<ECSComponent<'test'>>('test');
    expect(guard({ entity_id: 1 })).toBeFalsy();
  });

  test('component constructor constructs the right component', () => {
    const constructor =
      ecsComponent<ECSComponent<'comp', { prop: number }>>('comp');
    expect(constructor({ prop: 24 })).toStrictEqual({ comp: { prop: 24 } });
  });
});
