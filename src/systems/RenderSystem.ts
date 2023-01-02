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
import {
  getAnimationState,
  scheduleAnimation
} from '@/renderer/AnimationManager';
import {
  AnimationState,
  hasAnimatable,
  type Animatable
} from '@/entity/components/Animatable';

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

      const angle = (e.orientation.angle + 90) % 360;
      const hasChangedDirection = angle % 180 !== 0;

      if (
        hasChangedDirection &&
        getAnimationState(e.renderable.sprite) !== AnimationState.ATTACKING // temporary code
      ) {
        sprite.scale.x = angle > 180 ? -1 : 1;
      }

      if (hasAnimatable(e)) {
        triggerMovementAnimation(e);
      }
      sprite.position.set(e.position.x, e.position.y);
    });
  }
});
