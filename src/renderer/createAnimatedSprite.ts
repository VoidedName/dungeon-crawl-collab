import { sprites, texturesBundle } from '@/assets/sprites';
import * as PIXI from 'pixi.js';
import { createSpritesheetFrameObject } from '@/utils/aseprite';
import type { AnimationState } from '@/entity/components/Animatable';
import { Assets, type AnimatedSprite, type Texture } from 'pixi.js';
import { resolveRenderable } from './renderableManager';
import type { ECSEntityId } from '@/ecs/ECSEntity';

export type SpriteName = keyof typeof sprites;

type TexturesMap = Record<keyof typeof sprites, Texture>;
let texturesMap: TexturesMap;

export const loadSpriteTextures = async () => {
  await Assets.addBundle('spriteTextures', texturesBundle);

  texturesMap = await Assets.loadBundle('spriteTextures');
  await Promise.all(
    Object.entries(texturesMap).map(async ([spriteName, texture]) => {
      const { meta } = sprites[spriteName as SpriteName];

      const spritesheet = new PIXI.Spritesheet(texture, meta);
      spritesheetCache.set(texture, spritesheet);
      return spritesheet.parse();
    })
  );
};

const spritesheetCache = new Map<PIXI.Texture, PIXI.Spritesheet>();

export const updateTextures = (
  id: ECSEntityId,
  spriteName: SpriteName,
  animation: AnimationState
) => {
  const { meta } = sprites[spriteName];

  const sprite = resolveRenderable<AnimatedSprite>(id);

  sprite.textures = createSpritesheetFrameObject(
    animation,
    getSpritesheet(spriteName),
    meta
  );

  sprite.play();
};

export const getSpritesheet = (id: SpriteName) => {
  const texture = texturesMap[id];

  if (!texture) {
    throw new Error(`Could not get texture for sprite ${id}`);
  }

  return spritesheetCache.get(texture)!;
};

export const createAnimatedSprite = (
  id: SpriteName,
  initialAnimation: AnimationState
) => {
  const { meta } = sprites[id];

  const sprite = new PIXI.AnimatedSprite(
    createSpritesheetFrameObject(initialAnimation, getSpritesheet(id), meta)
  );

  sprite.anchor.set(0.5, 0.5);
  sprite.play();

  return sprite;
};
