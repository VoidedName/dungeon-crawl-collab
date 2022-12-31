import { sprites } from '@/assets/sprites';
import * as PIXI from 'pixi.js';
import {
  createSpritesheetFrameObject,
  parseAsperiteAnimationSheet
} from '@/utils/aseprite';
import { AnimationState, type AnimationOptions } from '@/entity/Animatable';

export type SpriteIdentifier = keyof typeof sprites;

export type CreateSpriteOptions = Partial<AnimationParams>;

const textureCache = new Map<string, Promise<PIXI.Texture>>();

export type SpriteWrapper = {
  sprite: PIXI.Container;
  transitionTo: (
    state: AnimationState,
    options?: Partial<AnimationOptions>
  ) => void;
};

export type AnimationParams = {
  state: AnimationState;
} & AnimationOptions;

export const createSprite = (
  id: SpriteIdentifier,
  {
    state = AnimationState.IDLE,
    loop = true,
    fallbackOnComplete = null,
    animationSpeed = 1
  }: CreateSpriteOptions = {}
): SpriteWrapper => {
  const container = new PIXI.Container();
  const { url, meta } = sprites[id];
  const spriteSheetData = parseAsperiteAnimationSheet(meta);

  let spritesheet: PIXI.Spritesheet;
  let sprite: PIXI.AnimatedSprite;

  const animationParams: AnimationParams = {
    state,
    loop,
    fallbackOnComplete,
    animationSpeed
  };

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
        animationParams.state,
        await getSpritesheet(),
        spriteSheetData
      )
    );
    sprite.anchor.set(0.5, 0.5);
    container.addChild(sprite);
  };

  const updateTextures = async () => {
    sprite.textures = createSpritesheetFrameObject(
      animationParams.state,
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

    sprite.loop = animationParams.loop ?? true;
    sprite.onComplete = () => {
      if (animationParams.fallbackOnComplete) {
        Object.assign(animationParams, {
          state: animationParams.fallbackOnComplete,
          loop: true,
          animationSpeed: 1,
          fallbackOnComplete: null
        });
        animate();
      }
    };
    sprite.animationSpeed = animationParams.animationSpeed ?? 1;

    sprite.play();
  };

  animate();

  return {
    sprite: container,

    transitionTo(state, options = {}) {
      if (state === animationParams.state) return;

      Object.assign(animationParams, { state, ...options });
      animate();
    }
  };
};
