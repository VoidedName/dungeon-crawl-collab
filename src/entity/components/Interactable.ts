import type { ECSComponent } from '@/ecs/ECSComponent';
import type { ECSEntity } from '@/ecs/ECSEntity';

const InteractableBrand = 'interactable';
type InteractableBrand = typeof InteractableBrand;
export type Interactable = ECSComponent<
  InteractableBrand,
  {
    text: string;
  }
>;
export function hasInteractable<E extends ECSEntity>(
  e: E
): e is E & Interactable {
  return InteractableBrand in e;
}
export const withInteractable = (text: string) => () =>
  interactableComponent(text);
export function interactableComponent(text: string): Interactable {
  return {
    [InteractableBrand]: {
      text
    }
  };
}
