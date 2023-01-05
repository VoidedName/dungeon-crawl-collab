import type { PlayerStats } from '@/entity/components/Player';
import type { ProjectileStats } from '@/entity/components/Projectile';
import type { SpriteName } from '@/renderer/createAnimatedSprite';
import type { AsepriteSheet } from '@/utils/aseprite';
import type { ISpritesheetData } from 'pixi.js';

export type SpriteResource = {
  url: string;
  meta: ISpritesheetData;
  asepriteMeta: AsepriteSheet;
};

export type CodexPlayerClass = {
  baseStats: PlayerStats;
  spriteName: SpriteName;
};

export type CodexEnemy = {
  baseStats: PlayerStats;
  spriteName: SpriteName;
};

export type CodexProjectile = {
  baseStats: ProjectileStats;
  spriteName: SpriteName;
};
