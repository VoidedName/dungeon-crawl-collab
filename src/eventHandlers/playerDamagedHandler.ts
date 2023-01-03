import type { TAudioManager } from '@/createAudioManager';
import type { ECSEntityId } from '@/ecs/ECSEntity';
import type { ECSWorld } from '@/ecs/ECSWorld';
import { PlayerBrand, type Player } from '@/entity/components/Player';
import {
  RenderableBrand,
  type Renderable
} from '@/entity/components/Renderable';
import { StatsBrand, type Stats } from '@/entity/components/Stats';
import type { DisplayObject, Sprite } from 'pixi.js';

const FLASH_DURATION = 150;

export const playerDamagedHandler = (
  damage: number,
  world: ECSWorld,
  resolveRenderable: (sprite: ECSEntityId) => DisplayObject,
  navigateTo: (path: string) => void
) => {
  const [player] = world.entitiesByComponent<[Player, Stats, Renderable]>([
    PlayerBrand,
    StatsBrand,
    RenderableBrand
  ]);
  if (!player) return;
  player.stats.current.health = Math.max(
    0,
    player.stats.current.health - damage
  );
  world.get<TAudioManager>('audio').match(
    audioManager => {
      audioManager.play('ouch');
    },
    () => console.warn('no audio manager set')
  );
  const playerSprite = resolveRenderable(player.entity_id) as Sprite;
  playerSprite.tint = 0xff0000;
  setTimeout(() => {
    playerSprite.tint = 0xffffff;
  }, FLASH_DURATION);

  if (player.stats.current.health <= 0) {
    alert('you dead');
    navigateTo('/');
  }
};
