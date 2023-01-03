import url from './wizard.png';
import asepriteMeta from './wizard.json';
import { parseAsperiteAnimationSheet } from '@/utils/aseprite';

export const wizard = {
  url,
  asepriteMeta: asepriteMeta,
  meta: parseAsperiteAnimationSheet(asepriteMeta)
};
