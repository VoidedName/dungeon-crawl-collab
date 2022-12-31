import type { ECSComponent } from '@/ecs/ECSComponent';
import type { ECSEntity } from '@/ecs/ECSEntity';
import type { Point } from '@/utils/types';

export const VelocityBrand = 'velocity';
type VelocityBrand = typeof VelocityBrand;
export type Velocity = ECSComponent<
  VelocityBrand,
  {
    speed: number;
    target: Point;
  }
>;

export function hasVelocity<E extends ECSEntity>(e: E): e is E & Velocity {
  return VelocityBrand in e;
}

export const withVelocity =
  (speed: number, target = { x: 0, y: 0 }) =>
  () => ({
    [VelocityBrand]: {
      speed,
      target
    }
  });
