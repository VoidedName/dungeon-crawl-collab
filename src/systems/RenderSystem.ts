import type { ECSSystem } from '@/ecs/ECSSystem';
import { PositionBrand, type Position } from '@/entity/Position';
import { type Renderable, RenderableBrand } from '@/entity/Renderable';
import type { DisplayObject } from 'pixi.js';

export const RenderSystem: (
  resolveSprite: (sprite: number) => DisplayObject
) => ECSSystem<[Position, Renderable]> = resolveSprite => ({
  target: [PositionBrand, RenderableBrand],
  run: entities => {
    entities.forEach(e => {
      const sprite = resolveSprite(e.renderable.sprite);
      sprite.x = e.position.x;
      sprite.y = e.position.y;
    });
  }
});
