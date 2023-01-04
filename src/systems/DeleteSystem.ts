import type { ECSSystem } from '@/ecs/ECSSystem';
import type { DisplayObject } from 'pixi.js';
import { hasRenderable } from '@/entity/components/Renderable';
import { DeleteBrand, type Delete } from '@/entity/components/Delete';
import type { ECSEntityId } from '@/ecs/ECSEntity';

export const DeleteSystem: (
  resolveRenderable: (sprite: ECSEntityId) => DisplayObject
) => ECSSystem<[Delete]> = resolveRenderable => ({
  target: [DeleteBrand],
  run: (ecs, props, entities) => {
    entities.forEach(entity => {
      ecs.deleteEntity(entity);
      if (hasRenderable(entity)) {
        const sprite = resolveRenderable(entity.entity_id);
        sprite.destroy();
      }
    });
  }
});
