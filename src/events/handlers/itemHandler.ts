import type { TItem } from '@/createInventoryManager';
import type { ECSWorld } from '@/ecs/ECSWorld';
import type { ECSEmitter } from '../createExternalQueue';

export const itemHandler = (item: TItem, world: ECSWorld, emit: ECSEmitter) => {
  item.item.onUse({ world: world, emit });
};
