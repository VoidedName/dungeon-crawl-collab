import { wizard } from './wizard';
import { trap } from './trap';
import type { SpriteResource } from '../types';

export const sprites = {
  wizard,
  trap
} satisfies Record<string, SpriteResource>;
