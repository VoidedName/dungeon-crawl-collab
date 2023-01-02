import type { ECSWorld } from '@/ecs/ECSWorld';
import { PlayerBrand, type Player } from '@/entity/components/Player';
import {
  RenderableBrand,
  type Renderable
} from '@/entity/components/Renderable';
import { StatsBrand, type Stats } from '@/entity/components/Stats';
import type { RenderableId } from '@/renderer/renderableCache';
import type { DisplayObject, Sprite } from 'pixi.js';

const FLASH_DURATION = 150;

export const playerDamagedHandler = (
  damage: number,
  world: ECSWorld,
  resolveSprite: (sprite: RenderableId) => DisplayObject
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
  const playerSprite = resolveSprite(player.renderable.sprite) as Sprite;
  playerSprite.tint = 0xff0000;
  setTimeout(() => {
    playerSprite.tint = 0xffffff;
  }, FLASH_DURATION);

  if (player.stats.current.health <= 0) {
    alert('you dead');
  }
};
