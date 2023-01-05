import type { ECSWorld } from '@/ecs/ECSWorld';
import {
  AnimatableBrand,
  type Animatable
} from '@/entity/components/Animatable';

import { PlayerBrand, type Player } from '@/entity/components/Player';
import {
  RenderableBrand,
  type Renderable
} from '@/entity/components/Renderable';
import { VelocityBrand, type Velocity } from '@/entity/components/Velocity';
import { PlayerStateTransitions } from '@/stateMachines/player';
import { resolveStateMachine } from '@/stateMachines/stateMachineManager';
import type { Point } from '@/utils/types';
import { setMagnitude } from '@/utils/vectors';

export function computeVelocity(directions: Directions, speed: number): Point {
  const vel = { x: 0, y: 0 };
  if (directions.right) {
    vel.x += 1;
  }
  if (directions.left) {
    vel.x -= 1;
  }
  if (directions.up) {
    vel.y -= 1;
  }
  if (directions.down) {
    vel.y += 1;
  }
  return setMagnitude(vel, speed);
}

export type Directions = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
};

export type Direction = keyof Directions;

export const keyboardMovementHandler = (
  directions: Directions,
  world: ECSWorld
) => {
  const [player] = world.entitiesByComponent<
    [Player, Velocity, Animatable, Renderable]
  >([PlayerBrand, VelocityBrand, AnimatableBrand, RenderableBrand]);

  if (!player) return;
  player.velocity = computeVelocity(
    directions,
    player.player.stats.current.speed
  );

  const machine = resolveStateMachine(player.entity_id);
  const isRunning = player.velocity.x !== 0 || player.velocity.y !== 0;

  machine.send(
    isRunning ? PlayerStateTransitions.RUN : PlayerStateTransitions.STOP_RUN
  );
};
