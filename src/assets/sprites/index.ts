import type { SpriteResource } from '../types';
import { wizard } from './wizard';
import { trap } from './trap';
import { magicMissile } from './magic-missile';
import { healthPotion } from './health-potion';
import { levelUpFX } from './fx';

export const sprites = {
  wizard,
  trap,
  magicMissile,
  healthPotion,
  levelUpFX
} satisfies Record<string, SpriteResource>;

export const texturesBundle = Object.fromEntries(
  Object.entries(sprites).map(([k, v]) => [k, v.url])
);
