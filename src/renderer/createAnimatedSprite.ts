import { sprites } from '@/assets/sprites';
import * as PIXI from 'pixi.js';
import {
  createSpritesheetFrameObject,
  parseAsperiteAnimationSheet
} from '@/utils/aseprite';
import type { AnimationState } from '@/entity/components/Animatable';
import type { AnimatedSprite, Renderer } from 'pixi.js';
import { resolveSprite, type RenderableId } from './renderableCache';

export type SpriteName = keyof typeof sprites;

const textureCache = new Map<string, Promise<PIXI.Texture>>();
const spritesheetCache = new Map<PIXI.Texture, PIXI.Spritesheet>();

export const updateTextures = async (
  id: RenderableId,
  spriteName: SpriteName,
  animation: AnimationState
) => {
  const { meta } = sprites[spriteName];

  const sprite = resolveSprite<AnimatedSprite>(id);
  const spriteSheetData = parseAsperiteAnimationSheet(meta);

  sprite.textures = createSpritesheetFrameObject(
    animation,
    await getSpritesheet(spriteName),
    spriteSheetData
  );

  sprite.play();
};

export const getSpritesheet = async (id: SpriteName) => {
  const { url, meta } = sprites[id];

  if (!textureCache.has(url)) {
    textureCache.set(url, PIXI.Assets.load(url) as Promise<PIXI.Texture>);
  }

  const texture = await textureCache.get(url)!;

  if (!spritesheetCache.has(texture)) {
    const spriteSheetData = parseAsperiteAnimationSheet(meta);
    const spritesheet = new PIXI.Spritesheet(texture, spriteSheetData);
    spritesheetCache.set(texture, spritesheet);
    await spritesheet.parse();
  }

  return spritesheetCache.get(texture)!;
};

export const createAnimatedSprite = async (
  id: SpriteName,
  initialAnimation: AnimationState
) => {
  const { meta } = sprites[id];
  const spriteSheetData = parseAsperiteAnimationSheet(meta);
  const sprite = new PIXI.AnimatedSprite(
    createSpritesheetFrameObject(
      initialAnimation,
      await getSpritesheet(id),
      spriteSheetData
    )
  );

  sprite.anchor.set(0.5, 0.5);
  sprite.play();

  return sprite;
};
