import type { SpriteResource } from '../types';
import { wizard } from './wizard';
import { trap } from './trap';
import { magicMissile } from './magic-missile';
import { healthPotion } from './health-potion';
import { levelUpFX } from './fx';
import { staff } from './staff';

export const sprites = {
  wizard,
  trap,
  magicMissile,
  healthPotion,
  levelUpFX,
  staff
} satisfies Record<string, SpriteResource>;

export const texturesBundle = Object.fromEntries(
  Object.entries(sprites).map(([k, v]) => [k, v.url])
);
