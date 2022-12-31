import type { DisplayObject } from 'pixi.js';

export type RenderableId = string | number;

const spriteLookup = new Map<RenderableId, DisplayObject>();

export const resolveSprite = <T extends DisplayObject>(id: RenderableId): T => {
  const sprite = spriteLookup.get(id);
  if (!sprite) {
    throw new Error(`sprite with id ${id} not found`);
  }

  return sprite as T;
};

export const register = async (id: RenderableId, renderable: DisplayObject) => {
  spriteLookup.set(id, renderable);
};
