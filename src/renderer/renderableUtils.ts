import type {
  Animatable,
  AnimationState
} from '@/entity/components/Animatable';
import { resolveRenderable } from './renderableManager';
import { sprites } from '@/assets/sprites';
import type { AnimatedSprite } from 'pixi.js';
import type { Rectangle, Values } from '@/utils/types';
import type { Position } from '@/entity/components/Position';
import type { Size } from '@/entity/components/Size';
import type { ECSEntity } from '@/ecs/ECSEntity';
import type { SpriteName } from './createAnimatedSprite';

export const HitBoxId = {
  BODY_COLLISION: 'body'
};

export type HitboxId = Values<typeof HitBoxId>;

export type GetHitboxOptions = {
  entity: Readonly<ECSEntity & Animatable & Position & Size>;
  hitboxId: HitboxId;
  animationState: AnimationState;
};

export const entityToRect = (entity: Position & Size): Rectangle => {
  return {
    x: entity.position.x - entity.size.w / 2,
    y: entity.position.y - entity.size.h / 2,
    ...entity.size
  };
};

export const getSpriteHitbox = ({
  entity,
  hitboxId,
  animationState
}: GetHitboxOptions): Rectangle => {
  const { asepriteMeta } = sprites[entity.animatable.spriteName];

  const sprite = resolveRenderable<AnimatedSprite>(entity.entity_id);
  const animation = asepriteMeta.meta.frameTags.find(
    tag => tag.name === animationState
  );

  if (!animation) {
    console.warn(`Could not get hitbox from animation ${animationState}`);
    return entityToRect(entity);
  }

  const slice = asepriteMeta.meta.slices.find(s => s.name === hitboxId);

  if (!slice) {
    console.warn(`Could not get hitbox from slice ${hitboxId}`);
    return entityToRect(entity);
  }

  const frameId = animation.from + sprite.currentFrame;
  const frame = slice.keys.find(key => key.frame === frameId);

  if (!frame) {
    console.warn(`Could not get hitbox from frame ${frameId}`);
    return entityToRect(entity);
  }

  return {
    x: entity.position.x - entity.size.w / 2 + frame.bounds.x,
    y: entity.position.y - entity.size.h / 2 + frame.bounds.y,
    w: frame.bounds.w,
    h: frame.bounds.h
  };
};

export const getAnimationDuration = (
  spriteName: SpriteName,
  name: AnimationState
) => {
  const { asepriteMeta } = sprites[spriteName];

  const animation = asepriteMeta.meta.frameTags.find(tag => tag.name === name);
  if (!animation) {
    console.warn(`Animation not found on ${spriteName}:  ${name}`);
    return 0;
  }

  return asepriteMeta.frames
    .slice(animation.from, animation.to + 1)
    .reduce((total, frame) => total + frame.duration, 0);
};
