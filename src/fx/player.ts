import type { TAudioManager } from '@/createAudioManager';
import type { PlayerEntity } from '@/entity/factories/createPlayer';
import type { ECSWorld } from '@/ecs/ECSWorld';
import { resolveRenderable } from '@/renderer/renderableManager';
import type { AnimatedSprite } from 'pixi.js';

export const playerHitFX = (entity: PlayerEntity, world: ECSWorld) => {
  world.get<TAudioManager>('audio').unwrap().play('ouch');

  const sprite = resolveRenderable<AnimatedSprite>(entity.entity_id);
  sprite.tint = 0xff0000;
};

export const playerHitEndFX = (entity: PlayerEntity) => {
  const sprite = resolveRenderable<AnimatedSprite>(entity.entity_id);
  sprite.tint = 0xffffff;
};
