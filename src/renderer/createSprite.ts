import { sprites } from '@/assets/sprites';
import * as PIXI from 'pixi.js';
import {
  createSpritesheetFrameObject,
  parseAsperiteAnimationSheet
} from '@/utils/aseprite';
import { AnimationState } from '@/entity/Animatable';

export type SpriteIdentifier = keyof typeof sprites;

export type CreateSpriteOptions = {
  id: SpriteIdentifier;
};

const textureCache = new Map<string, Promise<PIXI.Texture>>();

export type SpriteWrapper = {
  sprite: PIXI.Container;
  scheduleTransition: (params: Partial<AnimationParams>) => void;
  flushTransition: () => void;
};

export type AnimationParams = {
  state: AnimationState;
  loop?: boolean;
  onComplete?: () => void;
  animationSpeed?: number;
};

export const createSprite = ({ id }: CreateSpriteOptions): SpriteWrapper => {
  const container = new PIXI.Container();
  const { url, meta } = sprites[id];
  const spriteSheetData = parseAsperiteAnimationSheet(meta);

  let spritesheet: PIXI.Spritesheet;
  let sprite: PIXI.AnimatedSprite;
  const animationParams: AnimationParams = {
    state: AnimationState.IDLE,
    loop: true,
    onComplete: undefined,
    animationSpeed: 1
  };
  let flushPending = true;

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
    sprite.onComplete = animationParams.onComplete ?? undefined;
    sprite.animationSpeed = animationParams.animationSpeed ?? 1;

    sprite.play();
  };

  return {
    sprite: container,

    scheduleTransition(params) {
      if (params.state === animationParams.state) return;
      if (isDefined(params.state)) {
        animationParams.state = params.state;
      }

      animationParams.loop = params.loop ?? true;
      animationParams.onComplete = params.onComplete ?? undefined;
      animationParams.animationSpeed = params.animationSpeed ?? 1;
      flushPending = true;
    },

    flushTransition: () => {
      if (!flushPending) return;
      flushPending = false;
      animate();
    }
  };
};
