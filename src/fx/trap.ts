import type { TrapEntity } from '@/entity/factories/createTrap';
import { resolveRenderable } from '@/renderer/renderableManager';
import type { AnimatedSprite } from 'pixi.js';

export const trapHitFX = (entity: TrapEntity) => {
  const sprite = resolveRenderable<AnimatedSprite>(entity.entity_id);
  sprite.tint = 0xff0000;
};

export const trapHitEndFX = (entity: TrapEntity) => {
  const sprite = resolveRenderable<AnimatedSprite>(entity.entity_id);
  sprite.tint = 0xffffff;
};
