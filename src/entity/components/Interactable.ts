import type { ECSComponent } from '@/ecs/ECSComponent';
import type { ECSEntity } from '@/ecs/ECSEntity';

export type Interactables = 'stairsUp' | 'stairsDown' | 'item';
const InteractableBrand = 'interactable';
type InteractableBrand = typeof InteractableBrand;
export type Interactable = ECSComponent<
  InteractableBrand,
  {
    text: string;
    type: Interactables;
    isEnabled: boolean;
    interactionRadius: number;
  }
>;
export function hasInteractable<E extends ECSEntity>(
  e: E
): e is E & Interactable {
  return InteractableBrand in e;
}
export const withInteractable =
  (
    text: string,
    type: Interactables,
    isEnabled: boolean,
    interactionRadius: number
  ) =>
  () =>
    interactableComponent(text, type, isEnabled, interactionRadius);

export function interactableComponent(
  text: string,
  type: Interactables,
  isEnabled = true,
  interactionRadius: number
): Interactable {
  return {
    [InteractableBrand]: {
      text,
      type,
      isEnabled,
      interactionRadius
    }
  };
}
