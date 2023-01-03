import { wizard } from './wizard';
import { trap } from './trap';
import type { SpriteResource } from '../types';

export const sprites = {
  wizard,
  trap
} satisfies Record<string, SpriteResource>;

export const texturesBundle = Object.fromEntries(
  Object.entries(sprites).map(([k, v]) => [k, v.url])
);
