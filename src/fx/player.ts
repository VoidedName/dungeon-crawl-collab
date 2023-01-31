import type { TAudioManager } from '@/createAudioManager';
import type { PlayerEntity } from '@/entity/factories/createPlayer';
import type { ECSWorld } from '@/ecs/ECSWorld';
import { resolveRenderable } from '@/renderer/renderableManager';
import type { AnimatedSprite } from 'pixi.js';
import { createAnimatedSprite } from '@/renderer/createAnimatedSprite';
import { AnimationState } from '@/entity/components/Animatable';
import { getAnimationDuration } from '@/renderer/renderableUtils';
import type { ECSEntity } from '@/ecs/ECSEntity';

export const playerHitFX = (entity: PlayerEntity, world: ECSWorld) => {
  world.get<TAudioManager>('audio').unwrap().play('ouch');

  const sprite = resolveRenderable<AnimatedSprite>(entity.entity_id);
  sprite.tint = 0xff0000;
};

export const playerHitEndFX = (entity: PlayerEntity) => {
  const sprite = resolveRenderable<AnimatedSprite>(entity.entity_id);
  sprite.tint = 0xffffff;
};

export const onLevelUpFx = (entity: ECSEntity) => {
  const sprite = resolveRenderable<AnimatedSprite>(entity.entity_id);
  const fxSprite = createAnimatedSprite('levelUpFX', AnimationState.IDLE);
  sprite.addChild(fxSprite);
  setTimeout(() => {
    fxSprite.destroy();
  }, getAnimationDuration('levelUpFX', AnimationState.IDLE));
};
