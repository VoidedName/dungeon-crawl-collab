import type { ECSSystem } from '@/ecs/ECSSystem';
import type { Application, DisplayObject } from 'pixi.js';
import { PositionBrand, type Position } from '@/entity/components/Position';
import {
  type Renderable,
  RenderableBrand
} from '@/entity/components/Renderable';
import { VelocityBrand, type Velocity } from '@/entity/components/Velocity';
import type { RenderableId } from '@/renderer/renderableCache';
import {
  OrientationBrand,
  type Orientation
} from '@/entity/components/Orientation';

export const RenderSystem: (
  resolveSprite: (sprite: RenderableId) => DisplayObject,
  app: Application
) => ECSSystem<[Position, Renderable, Orientation]> = (resolveSprite, app) => ({
  target: [PositionBrand, RenderableBrand, OrientationBrand],
  run: entities => {
    entities.forEach(e => {
      const sprite = resolveSprite(e.renderable.sprite);

      if (!sprite.parent) {
        app.stage.addChild(sprite);
      }

      const angle = (e.orientation.angle + 90) % 360;
      const hasChangedDirection = angle % 180 !== 0;
      if (hasChangedDirection) {
        sprite.scale.x = angle > 180 ? -1 : 1;
      }

      sprite.position.set(e.position.x, e.position.y);
    });
  }
});
