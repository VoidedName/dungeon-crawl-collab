import type { ECSWorld } from '@/ecs/ECSWorld';
import {
  AnimatableBrand,
  type Animatable
} from '@/entity/components/Animatable';
import {
  MovementIntentBrand,
  type MovementIntent
} from '@/entity/components/MovementIntent';
import { PlayerBrand, type Player } from '@/entity/components/Player';
import {
  RenderableBrand,
  type Renderable
} from '@/entity/components/Renderable';
import { PlayerStateTransitions } from '@/stateMachines/player';
import { resolveStateMachine } from '@/stateMachines/stateMachineManager';

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
    [Player, MovementIntent, Animatable, Renderable]
  >([PlayerBrand, MovementIntentBrand, AnimatableBrand, RenderableBrand]);

  if (!player) return;
  player.movement_intent.up = directions.up;
  player.movement_intent.down = directions.down;
  player.movement_intent.left = directions.left;
  player.movement_intent.right = directions.right;

  const machine = resolveStateMachine(player.entity_id);
  const isRunning = Object.values(player.movement_intent).some(val => val);

  machine.send(
    isRunning ? PlayerStateTransitions.RUN : PlayerStateTransitions.STOP_RUN
  );
};
