import type { ECSSystem } from '@/ecs/ECSSystem';
import type { ECSWorld } from '@/ecs/ECSWorld';
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
import { SizeBrand, type Size } from '@/entity/components/Size';
import { StatsBrand, type Stats } from '@/entity/components/Stats';
import { VelocityBrand, type Velocity } from '@/entity/components/Velocity';
import type { Directions } from '@/eventHandlers/keyboardMovement';
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
    entities.forEach(e => {
      const collidables = world.entitiesByComponent<[Collidable]>([
        'collidable'
      ]);
      const prevVelocity = e.velocity;
      e.velocity = computeVelocity(e.movement_intent, e.stats.current.speed);
      e.position = addVector(e.position, { x: e.velocity.x, y: 0 });
      for (const collidable of collidables) {
        if (
          isColliding(collidable.collidable.hitbox, {
            x: e.position.x - e.size.w / 2,
            y: e.position.y - e.size.h / 2,
            ...e.size
          })
        ) {
          e.position = subVector(e.position, { x: e.velocity.x, y: 0 });
          break;
        }
      }

      e.position = addVector(e.position, { x: 0, y: e.velocity.y });
      for (const collidable of collidables) {
        if (
          isColliding(collidable.collidable.hitbox, {
            x: e.position.x - e.size.w / 2,
            y: e.position.y - e.size.h / 2,
            ...e.size
          })
        ) {
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
