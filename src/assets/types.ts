import type { StatsDescriptors } from '@/entity/components/Stats';
import type { SpriteName } from '@/renderer/createAnimatedSprite';
import type { AsepriteSheet } from '@/utils/aseprite';
import type { ISpritesheetData } from 'pixi.js';

export type SpriteResource = {
  url: string;
  meta: ISpritesheetData;
  asepriteMeta: AsepriteSheet;
};

export type PlayerClass = {
  baseStats: StatsDescriptors;
  spriteName: SpriteName;
};
