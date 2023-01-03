import type { ECSSystem } from '@/ecs/ECSSystem';
import { hasAnimatable } from '@/entity/components/Animatable';
import type { Collidable } from '@/entity/components/Collidable';
import { hasImmoveable } from '@/entity/components/Immoveable';
import {
  MovementIntentBrand,
  type MovementIntent
} from '@/entity/components/MovementIntent';
import {
  OrientationBrand,
  type Orientation
} from '@/entity/components/Orientation';
import { PositionBrand, type Position } from '@/entity/components/Position';
import { SizeBrand, type Size } from '@/entity/components/Size';
import { StatsBrand, type Stats } from '@/entity/components/Stats';
import { VelocityBrand, type Velocity } from '@/entity/components/Velocity';
import type { Directions } from '@/eventHandlers/keyboardMovement';
import { getAnimationState } from '@/renderer/AnimationManager';
import {
  entityToRect,
  getSpriteHitbox,
  HitBoxId
} from '@/renderer/renderableUtils';
import {
  directionAwareRectRectCollision,
  rectRectCollision
} from '@/utils/collisions';
import type { Point } from '@/utils/types';
import { addVector, mulVector, subVector } from '@/utils/vectors';

function normalize({ x, y }: { x: number; y: number }) {
  const len = Math.hypot(x, y);
  if (len === 0)
    return {
      x: 0,
      y: 0
    };
  return { x: x / len, y: y / len };
}

export function computeVelocity(directions: Directions, speed: number): Point {
  let dx = 0;
  let dy = 0;
  if (directions.right) {
    dx += 1;
  }
  if (directions.left) {
    dx -= 1;
  }
  if (directions.up) {
    dy -= 1;
  }
  if (directions.down) {
    dy += 1;
  }
  return mulVector(normalize({ x: dx, y: dy }), speed);
}

export const MovementSystem: () => ECSSystem<
  [Position, MovementIntent, Velocity, Stats, Orientation, Size]
> = () => ({
  target: [
    PositionBrand,
    MovementIntentBrand,
    VelocityBrand,
    StatsBrand,
    OrientationBrand,
    SizeBrand
  ],
  run: (world, props, entities) => {
    const collidables = world.entitiesByComponent<[Collidable]>(['collidable']);

    entities.forEach(e => {
      if (hasImmoveable(e)) {
        return;
      }

      const getHitbox = () =>
        hasAnimatable(e)
          ? getSpriteHitbox({
              entity: e,
              hitboxId: HitBoxId.BODY_COLLISION,
              animationState: getAnimationState(e.entity_id)!
            })
          : entityToRect(e);

      // snap back position to closest safe spot, to avoid getting stuck in a wall
      // this involves getting the potential overlaps with a collidable, in all 4 directions
      // then applying the minimal corrections possible to fix potential issues
      // there are a few cases this doesnt covers for now
      // - correcting in both the horizontal and vertical axis: potentially we could get stuck in a corner ? I guess fixing one direction should be enough
      // - having a large sprite going completely through a collidable: the directionAware collision check does not cover it because skill issue on my part è_é
      for (const collidable of collidables) {
        const { left, right, up, down } = directionAwareRectRectCollision(
          getHitbox(),
          collidable.collidable.hitbox
        );
        const horizontalCorrection = left > right ? -left : right;
        const verticalCorrection = up > down ? -up : down;
        if (horizontalCorrection === 0 && verticalCorrection === 0) continue;

        if (Math.abs(horizontalCorrection) < Math.abs(verticalCorrection)) {
          e.position.x += horizontalCorrection;
        } else {
          e.position.y += verticalCorrection;
        }
      }

      e.velocity = computeVelocity(e.movement_intent, e.stats.current.speed);
      e.position = addVector(e.position, { x: e.velocity.x, y: 0 });

      for (const collidable of collidables) {
        if (rectRectCollision(collidable.collidable.hitbox, getHitbox())) {
          e.position = subVector(e.position, { x: e.velocity.x, y: 0 });
          break;
        }
      }

      e.position = addVector(e.position, { x: 0, y: e.velocity.y });
      for (const collidable of collidables) {
        if (rectRectCollision(collidable.collidable.hitbox, getHitbox())) {
          e.position = subVector(e.position, { x: 0, y: e.velocity.y });
          break;
        }
      }
    });
  }
});
