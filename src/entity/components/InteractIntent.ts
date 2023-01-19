import type { ECSComponent } from '@/ecs/ECSComponent';
import type { ECSEntity } from '@/ecs/ECSEntity';

export const InteractIntentBrand = 'interact_intent';
type InteractIntentBrand = typeof InteractIntentBrand;
export type InteractIntent = ECSComponent<
  InteractIntentBrand,
  {
    isInteracting: boolean;
    canInteract: boolean;
    cooldown: number;
  }
>;

export function interactIntentComponent(cooldown = 200): InteractIntent {
  return {
    [InteractIntentBrand]: {
      isInteracting: false,
      canInteract: true,
      cooldown
    }
  };
}

export function hasInteractIntent<E extends ECSEntity>(
  e: E
): e is E & InteractIntent {
  return InteractIntentBrand in e;
}

export const withInteractIntent = () => interactIntentComponent;
