import type { ECSSystem } from '@/ecs/ECSSystem';
import {
  MovementIntentBrand,
  type MovementIntent
} from '@/entity/components/MovementIntent';
import {
  OrientationBrand,
  type Orientation
} from '@/entity/components/Orientation';
import { PositionBrand, type Position } from '@/entity/components/Position';
import { StatsBrand, type Stats } from '@/entity/components/Stats';
import { VelocityBrand, type Velocity } from '@/entity/components/Velocity';
import type { Directions } from '@/eventHandlers/keyboardMovement';
import type { Point } from '@/utils/types';
import { addVector, mulVector, toAngle } from '@/utils/vectors';

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

export const MovementSystem: ECSSystem<
  [Position, MovementIntent, Velocity, Stats, Orientation]
> = {
  target: [
    PositionBrand,
    MovementIntentBrand,
    VelocityBrand,
    StatsBrand,
    OrientationBrand
  ],
  run: entities => {
    entities.forEach(e => {
      const prevVelocity = e.velocity;
      e.velocity = computeVelocity(e.movement_intent, e.stats.current.speed);
      e.position = addVector(e.position, e.velocity);
      if (prevVelocity.x !== e.velocity.x) {
        e.orientation.angle = toAngle(e.velocity);
      }
    });
  }
};
