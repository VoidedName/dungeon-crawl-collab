import type { TrapEntity } from '@/entity/factories/createTrap';
import { resolveRenderable } from '@/renderer/renderableManager';
import type { AnimatedSprite, Application } from 'pixi.js';
import { damageNumberFx } from './common';

export const trapHitFX = (
  entity: TrapEntity,
  amount: number,
  app: Application
) => {
  const sprite = resolveRenderable<AnimatedSprite>(entity.entity_id);
  sprite.tint = 0xff0000;
  damageNumberFx(entity, amount, app);
};

export const trapHitEndFX = (entity: TrapEntity) => {
  const sprite = resolveRenderable<AnimatedSprite>(entity.entity_id);
  sprite.tint = 0xffffff;
};
