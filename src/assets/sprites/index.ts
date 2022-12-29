import { wizard } from './wizard';
import type { SpriteResource } from '../types';

export const sprites = {
  wizard: wizard
} satisfies Record<string, SpriteResource>;
