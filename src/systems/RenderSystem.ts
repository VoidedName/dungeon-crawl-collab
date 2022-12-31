import type { ECSSystem } from '@/ecs/ECSSystem';
import type { Application } from 'pixi.js';
import { PositionBrand, type Position } from '@/entity/Position';
import { type Renderable, RenderableBrand } from '@/entity/Renderable';
import { VelocityBrand, type Velocity } from '@/entity/Velocity';
import type { SpriteWrapper } from '@/renderer/createSprite';

export const RenderSystem: (
  resolveSprite: (sprite: number) => SpriteWrapper,
  app: Application
) => ECSSystem<[Position, Renderable, Velocity]> = (resolveSprite, app) => ({
  target: [PositionBrand, RenderableBrand, VelocityBrand],
  run: entities => {
    entities.forEach(e => {
      const { sprite } = resolveSprite(e.renderable.sprite);

      if (!sprite.parent) {
        app.stage.addChild(sprite);
      }

      if (e.velocity.target.x !== 0) {
        sprite.scale.x = e.velocity.target.x < 0 ? -1 : 1;
      }

      sprite.x = e.position.x;
      sprite.y = e.position.y;
    });
  }
});
