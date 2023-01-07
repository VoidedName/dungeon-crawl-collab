import type { ECSEmitter } from '@/createGameLoop';
import type { TItem } from '@/createInventoryManager';
import type { ECSWorld } from '@/ecs/ECSWorld';

export const itemHandler = (item: TItem, ecs: ECSWorld, emit: ECSEmitter) => {
  item.item.onUse({ ecs, emit });
};
