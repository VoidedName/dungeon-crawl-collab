import type { ECSComponent } from '@/ecs/ECSComponent';
import type { ECSEntity } from '@/ecs/ECSEntity';

const InteractableBrand = 'interactable';
type InteractableBrand = typeof InteractableBrand;
export type Interactable = ECSComponent<
  InteractableBrand,
  {
    text: string;
    interactionRadius: number;
  }
>;
export function hasInteractable<E extends ECSEntity>(
  e: E
): e is E & Interactable {
  return InteractableBrand in e;
}
export const withInteractable =
  (text: string, interactionRadius: number) => () =>
    interactableComponent(text, interactionRadius);

export function interactableComponent(
  text: string,
  interactionRadius: number
): Interactable {
  return {
    [InteractableBrand]: {
      text,
      interactionRadius
    }
  };
}
