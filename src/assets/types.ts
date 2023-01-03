import type { AsepriteSheet } from '@/utils/aseprite';
import type { ISpritesheetData } from 'pixi.js';

export type SpriteResource = {
  url: string;
  meta: ISpritesheetData;
  asepriteMeta: AsepriteSheet;
};
