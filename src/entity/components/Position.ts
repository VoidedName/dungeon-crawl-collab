import type { ECSComponent } from '@/ecs/ECSComponent';
import type { ECSEntity } from '@/ecs/ECSEntity';
import type { Point } from '@/utils/types';

export const PositionBrand = 'position';
type PositionBrand = typeof PositionBrand;
export type Position = ECSComponent<PositionBrand, Point>;

export function hasPosition<E extends ECSEntity>(e: E): e is E & Position {
  return PositionBrand in e;
}

export function positionComponent(x: number, y: number): Position {
  return {
    [PositionBrand]: {
      x,
      y
    }
  };
}

export const withPosition = (x: number, y: number) => () =>
  positionComponent(x, y);
