import type { ECSWorld } from '@/ecs/ECSWorld';

export const highlightInteractablesHandler = (
  isHighlightEnabled: boolean,
  ecs: ECSWorld
) => {
  ecs.set('highlightInteractables', isHighlightEnabled);
};
