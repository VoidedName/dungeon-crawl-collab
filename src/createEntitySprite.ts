import * as PIXI from 'pixi.js';
import { sprites } from '@/assets/sprites';
import {
  createSpritesheetFrameObject,
  parseAsperiteAnimationSheet
} from './utils/aseprite';

export type CreateEntitySpriteOptions = {
  id: keyof typeof sprites;
  initialAnimation: 'idle';
};
const loadedTextures = new Map<string, Promise<PIXI.Texture>>();

export const createEntitySprite = async ({
  id,
  initialAnimation
}: CreateEntitySpriteOptions) => {
  const { url, meta } = sprites[id];
  // avoid console warinings with HMR
  if (!loadedTextures.has(url)) {
    loadedTextures.set(url, PIXI.Assets.load(url) as Promise<PIXI.Texture>);
  }

  const texture = await loadedTextures.get(url)!;

  const data = parseAsperiteAnimationSheet(meta);
  const sheet = new PIXI.Spritesheet(texture, data);
  await sheet.parse();

  const sprite = new PIXI.AnimatedSprite(
    createSpritesheetFrameObject(initialAnimation, sheet, data)
  );

  sprite.anchor.set(0.5, 0.5);
  sprite.play();
  // sprite.anchor.set(0.5, 0.5);

  return sprite;
};
