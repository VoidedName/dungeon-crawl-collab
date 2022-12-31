import {
  createSprite,
  type SpriteIdentifier,
  type SpriteWrapper
} from '@/renderer/createSprite';

export type SpriteId = number;

const spriteLookup = new Map<SpriteId, SpriteWrapper>();

export const resolveSprite = (id: SpriteId) => {
  const sprite = spriteLookup.get(id);
  if (!sprite) throw new Error(`sprite withid ${id} not found`);

  return sprite;
};

export const register = (id: SpriteId, spriteName: SpriteIdentifier) => {
  spriteLookup.set(id, createSprite(spriteName));
};
