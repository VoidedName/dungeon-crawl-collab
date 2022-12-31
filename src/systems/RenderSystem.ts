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
      const { container } = resolveSprite(e.renderable.sprite);

      if (!container.parent) {
        app.stage.addChild(container);
      }

      if (e.velocity.target.x !== 0) {
        container.scale.x = e.velocity.target.x < 0 ? -1 : 1;
      }

      container.position.set(e.position.x, e.position.y);
    });
  }
});
