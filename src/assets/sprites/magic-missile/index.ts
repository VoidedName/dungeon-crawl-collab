import url from './magic-missile.png';
import asepriteMeta from './magic-missile.json';
import { parseAsperiteAnimationSheet } from '@/utils/aseprite';

export const magicMissile = {
  url,
  asepriteMeta: asepriteMeta,
  meta: parseAsperiteAnimationSheet(asepriteMeta)
};
