import url from './staff.png';
import asepriteMeta from './staff.json';
import { parseAsperiteAnimationSheet } from '@/utils/aseprite';

export const staff = {
  url,
  asepriteMeta: asepriteMeta,
  meta: parseAsperiteAnimationSheet(asepriteMeta)
};
