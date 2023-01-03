import type { ECSSystem } from '@/ecs/ECSSystem';
import type { DisplayObject } from 'pixi.js';
import { DeleteBrand, type Delete } from '@/entity/components/Delete';
import type { ECSEntityId } from '@/ecs/ECSEntity';
import { hasRenderable } from '@/entity/components/Renderable';

export const DeleteSystem: (
  resolveSprite: (sprite: ECSEntityId) => DisplayObject
) => ECSSystem<[Delete]> = resolveSprite => ({
  target: [DeleteBrand],
  run: (ecs, props, entities) => {
    entities.forEach(entity => {
      ecs.deleteEntity(entity);
      if (hasRenderable(entity)) {
        const sprite = resolveSprite(entity.entity_id);
        sprite.destroy();
      }
    });
  }
});
