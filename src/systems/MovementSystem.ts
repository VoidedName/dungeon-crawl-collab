import type { ECSSystem } from '@/ecs/ECSSystem';
import {
  MovementIntentBrand,
  type MovementIntent
} from '@/entity/MovementIntent';
import { PositionBrand, type Position } from '@/entity/Position';
import { VelocityBrand, type Velocity } from '@/entity/Velocity';
import type { Directions } from '@/eventHandlers/keyboardMovement';
import type { Point } from '@/utils/types';
import { addVector, mulVector } from '@/utils/vectors';

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

export const MovementSystem: ECSSystem<[Position, MovementIntent, Velocity]> = {
  target: [PositionBrand, MovementIntentBrand, VelocityBrand],
  run: entities => {
    entities.forEach(e => {
      e.position = addVector(
        e.position,
        computeVelocity(e.movement_intent, e.velocity.speed)
      );
    });
  }
};
