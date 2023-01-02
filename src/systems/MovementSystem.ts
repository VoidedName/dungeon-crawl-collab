import type { ECSSystem } from '@/ecs/ECSSystem';
import type { ECSWorld } from '@/ecs/ECSWorld';
import { hasAnimatable } from '@/entity/components/Animatable';
import type { Collidable } from '@/entity/components/Collidable';
import {
  MovementIntentBrand,
  type MovementIntent
} from '@/entity/components/MovementIntent';
import {
  OrientationBrand,
  type Orientation
} from '@/entity/components/Orientation';
import { PositionBrand, type Position } from '@/entity/components/Position';
import { hasRenderable } from '@/entity/components/Renderable';
import { SizeBrand, type Size } from '@/entity/components/Size';
import { StatsBrand, type Stats } from '@/entity/components/Stats';
import { VelocityBrand, type Velocity } from '@/entity/components/Velocity';
import type { Directions } from '@/eventHandlers/keyboardMovement';
import { getAnimationState } from '@/renderer/AnimationManager';
import {
  entityToRect,
  getSpriteHitbox,
  HitBoxId
} from '@/renderer/spriteHitbox';
import {
  directionAwareRectRectCollision,
  rectRectCollision
} from '@/utils/collisions';
import type { Point, Rectangle } from '@/utils/types';
import { addVector, mulVector, subVector, toAngle } from '@/utils/vectors';

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

function isColliding(rect1: Rectangle, rect2: Rectangle) {
  return (
    rect1.x < rect2.x + rect2.w &&
    rect1.x + rect1.w > rect2.x &&
    rect1.y < rect2.y + rect2.h &&
    rect1.h + rect1.y > rect2.y
  );
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
      const getHitbox = () =>
        hasRenderable(e) && hasAnimatable(e)
          ? getSpriteHitbox({
              entity: e,
              hitboxId: HitBoxId.BODY_COLLISION,
              animationState: getAnimationState(e.renderable.sprite)!
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
          console.log('snap back horizontal', horizontalCorrection);
          e.position.x += horizontalCorrection;
        } else {
          console.log('snap back vertical', horizontalCorrection);
          e.position.y += verticalCorrection;
        }
      }

      const prevVelocity = e.velocity;
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
