import type { ECSSystem } from '@/ecs/ECSSystem';
import type { Application, DisplayObject, Point } from 'pixi.js';
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
import {
  getAnimationState,
  scheduleAnimation
} from '@/renderer/AnimationManager';
import {
  AnimationState,
  hasAnimatable,
  type Animatable
} from '@/entity/components/Animatable';
import { hasPlayer } from '@/entity/components/MovementIntent';

export const RenderSystem: (
  resolveSprite: (sprite: RenderableId) => DisplayObject,
  app: Application
) => ECSSystem<[Position, Renderable, Orientation, Velocity]> = (
  resolveSprite,
  app
) => ({
  target: [PositionBrand, RenderableBrand, OrientationBrand, VelocityBrand],
  run: (ecs, props, entities) => {
    const triggerMovementAnimation = (
      e: typeof entities[number] & Animatable
    ) => {
      const isMoving = (e.velocity.x ?? 0) !== 0 || (e.velocity.y ?? 0) !== 0;

      const newState = isMoving ? AnimationState.RUNNING : AnimationState.IDLE;
      const currentState = getAnimationState(e.renderable.sprite);

      if (newState !== currentState) {
        scheduleAnimation(e.renderable.sprite, {
          state: isMoving ? AnimationState.RUNNING : AnimationState.IDLE,
          spriteName: e.animatable.spriteName
        });
      }
    };

    entities.forEach(e => {
      const sprite = resolveSprite(e.renderable.sprite);

      if (!sprite.parent) {
        app.stage.addChild(sprite);
      }

      sprite.position.set(e.position.x, e.position.y);

      // temporary - scheduling animation should be tied to an entity state machine
      if (hasAnimatable(e)) {
        triggerMovementAnimation(e);
      }

      const shouldSetOrientation =
        getAnimationState(e.renderable.sprite) !== AnimationState.ATTACKING;
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
    });
  }
});
