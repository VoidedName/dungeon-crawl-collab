import { sprites } from '@/assets/sprites';
import * as PIXI from 'pixi.js';
import {
  createSpritesheetFrameObject,
  parseAsperiteAnimationSheet
} from '@/utils/aseprite';

export type SpriteIdentifier = keyof typeof sprites;

export type SpriteAnimationState = 'idle' | 'running' | 'attacking';

export type TriggerAnimationOptions = {
  onComplete?: (sprite: PIXI.AnimatedSprite) => void;
  animationSpeed?: number;
  loop?: boolean;
};
export type CreateSpriteOptions = {
  id: SpriteIdentifier;
};

const textureCache = new Map<string, Promise<PIXI.Texture>>();

export const createSprite = ({ id }: CreateSpriteOptions): PIXI.Container => {
  const container = new PIXI.Container();
  const { url, meta } = sprites[id];
  const spriteSheetData = parseAsperiteAnimationSheet(meta);

  let spritesheet: PIXI.Spritesheet;

  const getTexture = () => {
    if (!textureCache.has(url)) {
      textureCache.set(url, PIXI.Assets.load(url) as Promise<PIXI.Texture>);
    }

    return textureCache.get(url)!;
  };

  const getSpritesheet = async () => {
    if (spritesheet) return spritesheet;

    const texture = await getTexture();
    const sheet = new PIXI.Spritesheet(texture, spriteSheetData);
    await sheet.parse();
    spritesheet = sheet;

    return spritesheet;
  };

  const load = async () => {
    const sprite = new PIXI.AnimatedSprite(
      createSpritesheetFrameObject(
        'idle',
        await getSpritesheet(),
        spriteSheetData
      )
    );

    sprite.anchor.set(0.5, 0.5);

    sprite.play();

    container.addChild(sprite);
  };

  load();

  return container;
};
