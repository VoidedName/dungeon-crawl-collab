import url from './health-potion.png';
import asepriteMeta from './health-potion.json';
import { parseAsperiteAnimationSheet } from '@/utils/aseprite';

export const healthPotion = {
  url,
  asepriteMeta: asepriteMeta,
  meta: parseAsperiteAnimationSheet(asepriteMeta)
};
