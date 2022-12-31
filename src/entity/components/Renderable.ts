import type { ECSComponent } from '@/ecs/ECSComponent';
import type { ECSEntity } from '@/ecs/ECSEntity';
import type { SpriteId } from '@/sprite/Sprite';

const RenderableBrand = 'renderable';
type RenderableBrand = typeof RenderableBrand;
export type Renderable = ECSComponent<
  RenderableBrand,
  {
    sprite: SpriteId;
  }
>;

export function hasRenderable<E extends ECSEntity>(e: E): e is E & Renderable {
  return RenderableBrand in e;
}

export function renderableComponent(sprite: SpriteId): Renderable {
  return {
    [RenderableBrand]: {
      sprite
    }
  };
}

export const withRenderable = (sprite: SpriteId) => () =>
  renderableComponent(sprite);
