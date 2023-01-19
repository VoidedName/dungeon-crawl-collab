import type { ECSWorld } from '@/ecs/ECSWorld';

export const highlightInteractablesHandler = (
  isHighlightEnabled: boolean,
  world: ECSWorld
) => {
  world.set('highlightInteractables', isHighlightEnabled);
};
