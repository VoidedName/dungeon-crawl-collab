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
  initialAnimation: SpriteAnimationState;
  id: SpriteIdentifier;
};

const textureCache = new Map<string, Promise<PIXI.Texture>>();

export type GameSprite = {
  container: PIXI.Container;
  currentAnimation: Readonly<SpriteAnimationState>;
  transitionTo: (
    animation: SpriteAnimationState,
    options?: TriggerAnimationOptions
  ) => void;
};

export const createSprite = ({
  initialAnimation,
  id
}: CreateSpriteOptions): GameSprite => {
  const container = new PIXI.Container();
  const { url, meta } = sprites[id];
  const spriteSheetData = parseAsperiteAnimationSheet(meta);
  let currentAnimation = initialAnimation;

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

  const animate = async ({
    onComplete,
    animationSpeed = 1,
    loop = true
  }: TriggerAnimationOptions) => {
    container.removeChildren();

    const sprite = new PIXI.AnimatedSprite(
      createSpritesheetFrameObject(
        currentAnimation,
        await getSpritesheet(),
        spriteSheetData
      )
    );

    sprite.anchor.set(0.5, 0.5);
    sprite.loop = loop;
    sprite.animationSpeed = animationSpeed;
    sprite.onComplete = () => {
      onComplete?.(sprite);
    };
    sprite.play();

    container.addChild(sprite);
  };

  animate({});

  return {
    container,
    transitionTo(animation, options = {}) {
      if (currentAnimation === animation) return;
      currentAnimation = animation;
      animate(options);
    },
    get currentAnimation() {
      return currentAnimation;
    }
  };
};
