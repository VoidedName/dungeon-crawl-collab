import type { ECSSystem } from '@/ecs/ECSSystem';
import type { DisplayObject } from 'pixi.js';
import { hasRenderable } from '@/entity/components/Renderable';
import type { RenderableId } from '@/renderer/renderableCache';
import { DeleteBrand, type Delete } from '@/entity/components/Delete';

export const DeleteSystem: (
  resolveSprite: (sprite: RenderableId) => DisplayObject
) => ECSSystem<[Delete]> = resolveSprite => ({
  target: [DeleteBrand],
  run: (ecs, props, entities) => {
    entities.forEach(entity => {
      ecs.deleteEntity(entity);
      if (hasRenderable(entity)) {
        const sprite = resolveSprite(entity.renderable.sprite);
        sprite.destroy();
      }
    });
  }
});
