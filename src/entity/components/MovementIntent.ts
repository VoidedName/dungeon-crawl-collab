import type { ECSComponent } from '@/ecs/ECSComponent';
import type { ECSEntity } from '@/ecs/ECSEntity';

export const MovementIntentBrand = 'movement_intent';
type MovementIntentBrand = typeof MovementIntentBrand;
export type MovementIntent = ECSComponent<
  MovementIntentBrand,
  {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
  }
>;

export function movementIntentComponent(): MovementIntent {
  return {
    [MovementIntentBrand]: {
      up: false,
      down: false,
      left: false,
      right: false
    }
  };
}

export function hasPlayer<E extends ECSEntity>(e: E): e is E & MovementIntent {
  return MovementIntentBrand in e;
}

export const withMovementIntent = () => movementIntentComponent;
