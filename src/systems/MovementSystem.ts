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
import type { Direction, Directions } from '@/eventHandlers/keyboardMovement';
import { getAnimationState } from '@/renderer/AnimationManager';
import {
  HitBoxId,
  entityToRect,
  getSpriteHitbox
} from '@/renderer/spriteHitbox';
import {
  rectRectCollision,
  directionAwareRectRectCollision
} from '@/utils/collisions';
import type { Point } from '@/utils/types';
import {
  addVector,
  mulVector,
  normalizeVector,
  subVector,
  toAngle
} from '@/utils/vectors';
import { isNever } from '@/utils/assertions';

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
  return mulVector(normalizeVector({ x: dx, y: dy }), speed);
}

export const MovementSystem: (
  world: ECSWorld
) => ECSSystem<
  [Position, MovementIntent, Velocity, Stats, Orientation, Size]
> = world => ({
  target: [
    PositionBrand,
    MovementIntentBrand,
    VelocityBrand,
    StatsBrand,
    OrientationBrand,
    SizeBrand
  ],
  run: entities => {
    const collidables = world.entitiesByComponent<[Collidable]>(['collidable']);

    entities.forEach(e => {
      const getHitbox = () =>
        hasRenderable(e) && hasAnimatable(e)
          ? getSpriteHitbox({
              entity: e,
              hitboxId: HitBoxId.BODY,
              animationState: getAnimationState(e.renderable.sprite)!
            })
          : entityToRect(e);

      const snapBack = (collidable: Collidable, direction: Direction) => {
        switch (direction) {
          case 'left':
            e.position.x = collidable.collidable.hitbox.x - e.size.w;
            return;
          case 'right':
            e.position.x =
              collidable.collidable.hitbox.x + collidable.collidable.hitbox.w;
            return;
          case 'up':
            e.position.y = collidable.collidable.hitbox.y - e.size.h;
            return;
          case 'down':
            e.position.y =
              collidable.collidable.hitbox.y + collidable.collidable.hitbox.h;
            return;
          default:
            isNever(direction);
        }
      };
      console.groupCollapsed();
      for (const collidable of collidables) {
        const collision = directionAwareRectRectCollision(
          getHitbox(),
          collidable.collidable.hitbox
        );
        console.log(collidable.entity_id, collision);
        if (collision) snapBack(collidable, collision);
      }

      console.groupEnd();
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

      if (prevVelocity.x !== e.velocity.x) {
        e.orientation.angle = toAngle(e.velocity);
      }
    });
  }
});
