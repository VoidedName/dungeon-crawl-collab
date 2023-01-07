import type { SpriteResource } from '../types';
import { wizard } from './wizard';
import { trap } from './trap';
import { magicMissile } from './magic-missile';
import { healthPotion } from './health-potion';

export const sprites = {
  wizard,
  trap,
  magicMissile,
  healthPotion
} satisfies Record<string, SpriteResource>;

export const texturesBundle = Object.fromEntries(
  Object.entries(sprites).map(([k, v]) => [k, v.url])
);
