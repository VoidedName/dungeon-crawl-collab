import type { ECSComponent } from '@/ecs/ECSComponent';
import type { ECSEntity } from '@/ecs/ECSEntity';

const VelocityBrand = 'velocity';
type VelocityBrand = typeof VelocityBrand;
export type Velocity = ECSComponent<
  VelocityBrand,
  {
    x: number;
    y: number;
  }
>;

export function hasVelocity<E extends ECSEntity>(e: E): e is E & Velocity {
  return VelocityBrand in e;
}

export const withVelocity = (x: number, y: number) => () => ({
  [VelocityBrand]: {
    x,
    y
  }
});
