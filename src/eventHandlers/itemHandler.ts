import type { TItem } from '@/createInventoryManager';
import type { ECSWorld } from '@/ecs/ECSWorld';
import { getPlayer } from '@/utils/getPlayer';
import { clamp } from '@/utils/math';

const POTION_HEAL_AMOUNT = 5;

export const itemHandler = (item: TItem, ecs: ECSWorld) => {
  if (item.name === 'potion') {
    const player = getPlayer(ecs);
    player.player.stats.current.health = clamp(
      player.player.stats.current.health + POTION_HEAL_AMOUNT,
      0,
      player.player.stats.base.health
    );
  }
};
