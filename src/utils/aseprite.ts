import * as PIXI from 'pixi.js';
import type { FrameObject, ISpritesheetData, Spritesheet } from 'pixi.js';

export interface AsepriteSheet {
  frames: FrameElement[];
  meta: Meta;
}

export interface FrameElement {
  filename: string;
  frame: SpriteSourceSizeClass;
  rotated: boolean;
  trimmed: boolean;
  spriteSourceSize: SpriteSourceSizeClass;
  sourceSize: Size;
  duration: number;
}

export interface SpriteSourceSizeClass {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Size {
  w: number;
  h: number;
}

export interface Meta {
  app: string;
  version: string;
  image: string;
  format: string;
  size: Size;
  scale: string;
  frameTags: FrameTag[];
}

export interface FrameTag {
  name: string;
  from: number;
  to: number;
  direction: string;
}

export function parseAsperiteAnimationSheet(
  asepritesheet: AsepriteSheet
): ISpritesheetData {
  return {
    frames: Object.fromEntries(
      asepritesheet.frames.map(frame => {
        const frameName = `${frame.filename}`;
        // avoids console warnings with HMR
        if (import.meta.env.DEV) {
          PIXI.Texture.removeFromCache(frameName);
        }
        return [frameName, frame];
      })
    ),
    animations: Object.fromEntries(
      asepritesheet.meta.frameTags.map(tag => [
        tag.name,
        asepritesheet.frames
          .slice(tag.from, tag.to + 1)
          .map(frame => frame.filename)
      ])
    ),
    meta: { scale: '1' }
  };
}

export const createSpritesheetFrameObject = (
  name: string,
  spritesheet: Spritesheet,
  spritesheetData: ISpritesheetData
): FrameObject[] => {
  const frames = spritesheet.animations[name];
  if (!frames) throw new Error(`unknown animation: ${name}`);

  return frames.map((frame, index) => {
    const frameName = spritesheetData.animations?.[name]?.[index];
    return {
      texture: frame,
      // @ts-ignore bruh
      time: spritesheetData.frames[frameName].duration
    };
  });
};
