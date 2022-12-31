import type { ECSSystem } from '@/ecs/ECSSystem';
import type { Position } from '@/entity/components/Position';
import type { Renderable } from '@/entity/components/Renderable';
import type { DisplayObject } from 'pixi.js';

export const RenderSystem: (
  resolveSprite: (sprite: number) => DisplayObject
) => ECSSystem<[Position, Renderable]> = resolveSprite => ({
  target: ['position', 'renderable'],
  run: entities => {
    entities.forEach(e => {
      const sprite = resolveSprite(e.renderable.sprite);
      sprite.x = e.position.x;
      sprite.y = e.position.y;
    });
  }
});
