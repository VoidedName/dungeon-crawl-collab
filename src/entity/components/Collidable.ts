import type { ECSComponent } from '@/ecs/ECSComponent';
import type { ECSEntity } from '@/ecs/ECSEntity';
import type { Rectangle } from '@/utils/types';

export const CollidableBrand = 'collidable';
type CollidableBrand = typeof CollidableBrand;
export type Collidable = ECSComponent<
  CollidableBrand,
  {
    hitbox: Rectangle;
  }
>;

export function hasCollidable<E extends ECSEntity>(e: E): e is E & Collidable {
  return CollidableBrand in e;
}

export function collidableComponent(hitbox: Rectangle): Collidable {
  return {
    [CollidableBrand]: {
      hitbox
    }
  };
}

export const withCollidable = (hitbox: Rectangle) => () =>
  collidableComponent(hitbox);
