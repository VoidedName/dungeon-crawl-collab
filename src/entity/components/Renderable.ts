import type { sprites } from '@/assets/sprites';
import type { ECSComponent } from '@/ecs/ECSComponent';
import type { ECSEntity } from '@/ecs/ECSEntity';
import type { SpriteName } from '@/renderer/createAnimatedSprite';
import type { RenderableId } from '@/renderer/renderableCache';

export const RenderableBrand = 'renderable';
type RenderableBrand = typeof RenderableBrand;
export type Renderable = ECSComponent<
  RenderableBrand,
  {
    sprite: RenderableId;
  }
>;

export function hasRenderable<E extends ECSEntity>(e: E): e is E & Renderable {
  return RenderableBrand in e;
}

export function renderableComponent(id: RenderableId): Renderable {
  return {
    [RenderableBrand]: {
      sprite: id
    }
  };
}

export const withRenderable = (id: RenderableId) => () =>
  renderableComponent(id);
