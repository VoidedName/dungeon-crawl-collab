import type { CodexItem } from '@/assets/types';
import type { TAudioManager } from '@/createAudioManager';
import { getPlayer } from '@/utils/getPlayer';
import { clamp } from '@/utils/math';

const POTION_HEAL_AMOUNT = 5;
export const healthPotion = (): CodexItem => ({
  spriteName: 'healthPotion',
  type: 'item',
  onUse: ({ world, emit }) => {
    const player = getPlayer(world);
    player.player.stats.current.health = clamp(
      player.player.stats.current.health + POTION_HEAL_AMOUNT,
      0,
      player.player.stats.base.health
    );
    emit('playerUpdate');
    world.get<TAudioManager>('audio').unwrap().play('drink');
  }
});
