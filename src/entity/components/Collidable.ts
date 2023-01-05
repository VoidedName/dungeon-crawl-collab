import { ecsComponent, type ECSComponent } from '@/ecs/ECSComponent';
import type { ECSEntity } from '@/ecs/ECSEntity';

export const CollidableBrand = 'collidable';
type CollidableBrand = typeof CollidableBrand;
export type Collidable = ECSComponent<CollidableBrand>;

export function hasCollidable<E extends ECSEntity>(e: E): e is E & Collidable {
  return CollidableBrand in e;
}

export const collidableComponent = ecsComponent<Collidable>(CollidableBrand);
