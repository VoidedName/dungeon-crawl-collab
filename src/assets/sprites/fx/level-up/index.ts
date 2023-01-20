import url from './level-up.png';
import asepriteMeta from './level-up.json';
import { parseAsperiteAnimationSheet } from '@/utils/aseprite';

export const levelUpFX = {
  url,
  asepriteMeta: asepriteMeta,
  meta: parseAsperiteAnimationSheet(asepriteMeta)
};
