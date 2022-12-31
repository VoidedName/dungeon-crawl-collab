import type { ECSComponent } from '@/ecs/ECSComponent';
import type { ECSEntity } from '@/ecs/ECSEntity';

export const VelocityBrand = 'velocity';
type VelocityBrand = typeof VelocityBrand;
export type Velocity = ECSComponent<
  VelocityBrand,
  {
    speed: number;
  }
>;

export function hasVelocity<E extends ECSEntity>(e: E): e is E & Velocity {
  return VelocityBrand in e;
}

export const withVelocity = (speed: number) => () => ({
  [VelocityBrand]: {
    speed
  }
});
