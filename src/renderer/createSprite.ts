import { sprites } from '@/assets/sprites';
import * as PIXI from 'pixi.js';
import {
  createSpritesheetFrameObject,
  parseAsperiteAnimationSheet
} from '@/utils/aseprite';
import type { AnimationState } from '@/entity/Animatable';
import type { AnimatedSprite } from 'pixi.js';

export type SpriteIdentifier = keyof typeof sprites;

const textureCache = new Map<string, Promise<PIXI.Texture>>();

export type SpriteWrapper = {
  container: PIXI.Container;
  transitionTo: (
    state: AnimationState,
    prepareFn?: (sprite: AnimatedSprite) => void
  ) => void;
  currentAnimation: Readonly<AnimationState>;
};

export const createSprite = (
  id: SpriteIdentifier,
  initialAnimation: AnimationState
): SpriteWrapper => {
  const container = new PIXI.Container();
  const { url, meta } = sprites[id];
  const spriteSheetData = parseAsperiteAnimationSheet(meta);

  let spritesheet: PIXI.Spritesheet;
  let sprite: PIXI.AnimatedSprite;

  let currentAnimation: AnimationState = initialAnimation;

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

  const initSprite = async () => {
    sprite = new PIXI.AnimatedSprite(
      createSpritesheetFrameObject(
        currentAnimation,
        await getSpritesheet(),
        spriteSheetData
      )
    );
    sprite.anchor.set(0.5, 0.5);
    container.addChild(sprite);
  };

  const updateTextures = async () => {
    sprite.textures = createSpritesheetFrameObject(
      currentAnimation,
      await getSpritesheet(),
      spriteSheetData
    );
  };

  const animate = async () => {
    if (!sprite) {
      await initSprite();
    } else {
      await updateTextures();
    }

    sprite.play();
  };

  animate();

  return {
    container,

    transitionTo(state, prepareFn) {
      currentAnimation = state;
      if (prepareFn) prepareFn(sprite);
      animate();
    },

    get currentAnimation() {
      return currentAnimation;
    }
  };
};
