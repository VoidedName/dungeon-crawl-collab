import url from './trap.png';
import asepriteMeta from './trap.json';
import { parseAsperiteAnimationSheet } from '@/utils/aseprite';

export const trap = {
  url,
  asepriteMeta: asepriteMeta,
  meta: parseAsperiteAnimationSheet(asepriteMeta)
};
