import type { ECSEntityId } from '@/ecs/ECSEntity';
import type { DisplayObject } from 'pixi.js';

const spriteLookup = new Map<ECSEntityId, DisplayObject>();

export const resolveSprite = <T extends DisplayObject>(id: ECSEntityId): T => {
  const sprite = spriteLookup.get(id);
  if (!sprite) {
    throw new Error(`sprite with id ${id} not found`);
  }

  return sprite as T;
};

export const register = (id: ECSEntityId, renderable: DisplayObject) => {
  spriteLookup.set(id, renderable);
};
