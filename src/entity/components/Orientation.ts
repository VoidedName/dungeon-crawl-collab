import type { ECSComponent } from '@/ecs/ECSComponent';
import type { ECSEntity } from '@/ecs/ECSEntity';

export type AngleInDegrees = number;

export const OrientationBrand = 'orientation';
type OrientationBrand = typeof OrientationBrand;
export type Orientation = ECSComponent<
  OrientationBrand,
  { angle: AngleInDegrees }
>;

export function hasVelocity<E extends ECSEntity>(e: E): e is E & Orientation {
  return OrientationBrand in e;
}

export const withOrientation = (angle: AngleInDegrees) => () => ({
  [OrientationBrand]: {
    angle
  }
});
