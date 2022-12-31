import type { ECSWorld } from '@/ecs/ECSWorld';
import {
  AnimatableBrand,
  type Animatable,
  AnimationState
} from '@/entity/Animatable';
import {
  MovementIntentBrand,
  type MovementIntent
} from '@/entity/MovementIntent';
import { PlayerBrand, type Player } from '@/entity/Player';
import { RenderableBrand, type Renderable } from '@/entity/Renderable';
import type { SpriteWrapper } from '@/renderer/createSprite';
import type { SpriteId } from '@/sprite/Sprite';

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
  const [player] = world.entitiesByComponent<
    [Player, MovementIntent, Animatable, Renderable]
  >([PlayerBrand, MovementIntentBrand, AnimatableBrand, RenderableBrand]);

  if (!player) return;
  player.movement_intent.up = directions.up;
  player.movement_intent.down = directions.down;
  player.movement_intent.left = directions.left;
  player.movement_intent.right = directions.right;

  const isMoving = Object.values(directions).some(d => d === true);

  player.animatable.animationState = isMoving
    ? AnimationState.RUNNING
    : AnimationState.IDLE;
};
