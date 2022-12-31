import type { ECSSystem } from '@/ecs/ECSSystem';
import type { Application, DisplayObject } from 'pixi.js';
import { PositionBrand, type Position } from '@/entity/components/Position';
import {
  type Renderable,
  RenderableBrand
} from '@/entity/components/Renderable';
import { VelocityBrand, type Velocity } from '@/entity/components/Velocity';
import type { RenderableId } from '@/renderer/renderableCache';

export const RenderSystem: (
  resolveSprite: (sprite: RenderableId) => DisplayObject,
  app: Application
) => ECSSystem<[Position, Renderable, Velocity]> = (resolveSprite, app) => ({
  target: [PositionBrand, RenderableBrand, VelocityBrand],
  run: entities => {
    entities.forEach(e => {
      const sprite = resolveSprite(e.renderable.sprite);

      if (!sprite.parent) {
        app.stage.addChild(sprite);
      }

      if (e.velocity.target.x !== 0) {
        sprite.scale.x = e.velocity.target.x < 0 ? -1 : 1;
      }

      sprite.position.set(e.position.x, e.position.y);
    });
  }
});
