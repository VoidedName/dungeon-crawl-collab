import type { ECSComponent } from '@/ecs/ECSComponent';
import type { ECSEntity } from '@/ecs/ECSEntity';
import type { SpriteIdentifier } from '@/renderer/createSprite';
import { register, type SpriteId } from '@/sprite/Sprite';

export const RenderableBrand = 'renderable';
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

export function renderableComponent(
  id: SpriteId,
  sprite: SpriteIdentifier
): Renderable {
  register(id, sprite);

  return {
    [RenderableBrand]: {
      sprite: id
    }
  };
}

export const withRenderable = (id: SpriteId, sprite: SpriteIdentifier) => () =>
  renderableComponent(id, sprite);
