import type { ECSSystem } from '@/ecs/ECSSystem';
import type { Application, DisplayObject, Point } from 'pixi.js';
import { PositionBrand, type Position } from '@/entity/components/Position';
import {
  type Renderable,
  RenderableBrand
} from '@/entity/components/Renderable';
import { hasOrientation } from '@/entity/components/Orientation';
import { getAnimationState } from '@/renderer/AnimationManager';
import { AnimationState } from '@/entity/components/Animatable';
import type { ECSEntityId } from '@/ecs/ECSEntity';
import { hasProjectile } from '@/entity/components/Projectile';
import { deg2Rad } from '@/utils/math';
import { hasPlayer } from '@/entity/components/Player';

export const RenderSystem: (
  resolveRenderable: (sprite: ECSEntityId) => DisplayObject,
  app: Application
) => ECSSystem<[Position, Renderable]> = (resolveRenderable, app) => ({
  target: [PositionBrand, RenderableBrand],
  run: (ecs, props, entities) => {
    entities.forEach(e => {
      const sprite = resolveRenderable(e.entity_id);

      if (!sprite.parent) {
        app.stage.addChild(sprite);
      }

      sprite.position.set(e.position.x, e.position.y);

      const shouldSetOrientation =
        getAnimationState(e.entity_id) !== AnimationState.ATTACKING;

      if (hasPlayer(e) && shouldSetOrientation) {
        // not sure why it's marked at private, this information is pretty useful
        // this might be a pixi 7 oversight, as they replaced InteractionManager with EventSystem
        // anywho, this gives us mouse position relative to the app stage
        const mousePosition = (app.renderer.events as any).rootPointerEvent
          .global as Point;

        const scaleX =
          mousePosition.x < sprite.toGlobal({ x: 0, y: 0 }).x ? -1 : 1;
        sprite.scale.set(scaleX, 1);
      }

      if (hasProjectile(e) && hasOrientation(e)) {
        sprite.rotation = deg2Rad(e.orientation.angle);
      }
    });
  }
});
