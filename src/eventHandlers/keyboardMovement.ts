import type { ECSWorld } from '@/ecs/ECSWorld';
import {
  MovementIntentBrand,
  type MovementIntent
} from '@/entity/MovementIntent';
import { PlayerBrand, type Player } from '@/entity/Player';

export type Directions = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
};
export const keyboardMovementHandler = (
  directions: Directions,
  world: ECSWorld
) => {
  const [player] = world.entitiesByComponent<[Player, MovementIntent]>([
    PlayerBrand,
    MovementIntentBrand
  ]);

  if (!player) return;
  player.movement_intent.up = directions.up;
  player.movement_intent.down = directions.down;
  player.movement_intent.left = directions.left;
  player.movement_intent.right = directions.right;
};
