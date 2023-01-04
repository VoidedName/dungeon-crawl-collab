import type { ECSSystem } from '@/ecs/ECSSystem';
import type { DisplayObject } from 'pixi.js';
import {
  type Renderable,
  RenderableBrand
} from '@/entity/components/Renderable';
import type { ECSEntityId } from '@/ecs/ECSEntity';
import { EnemyBrand, type Enemy } from '@/entity/components/Enemy';
import { PlayerBrand, type Player } from '@/entity/components/Player';
import { getSpriteHitbox, HitBoxId } from '@/renderer/renderableUtils';
import { rectRectCollision } from '@/utils/collisions';
import { PositionBrand, type Position } from '@/entity/components/Position';
import { SizeBrand, type Size } from '@/entity/components/Size';
import { resolveStateMachine } from '@/stateMachines/stateMachineManager';
import { TrapState, TrapStateTransitions } from '@/stateMachines/trap';
import {
  AnimatableBrand,
  type Animatable
} from '@/entity/components/Animatable';
import { getAnimationState } from '@/renderer/AnimationManager';
import { EventNames, type GameLoopQueue } from '@/createGameLoop';

export const EnemySystem: (
  resolveRenderable: (sprite: ECSEntityId) => DisplayObject,
  queue: GameLoopQueue
) => ECSSystem<[Enemy, Renderable, Animatable, Position, Size]> = (
  resolveRenderable,
  queue
) => ({
  target: [
    EnemyBrand,
    RenderableBrand,
    AnimatableBrand,
    PositionBrand,
    SizeBrand
  ],
  run: (ecs, props, entities) => {
    const [player] = ecs.entitiesByComponent<
      [Player, Animatable, Position, Size]
    >([PlayerBrand, AnimatableBrand, PositionBrand, SizeBrand]);

    if (!player) return;

    entities.forEach(entity => {
      if (entity.enemy.type === 'trap') {
        const machine = resolveStateMachine(entity.entity_id);
        if (
          machine.getSnapshot().value === TrapState.IDLE &&
          rectRectCollision(
            getSpriteHitbox({
              entity: player,
              hitboxId: HitBoxId.BODY_COLLISION,
              animationState: getAnimationState(player.entity_id)!
            }),
            getSpriteHitbox({
              entity,
              hitboxId: HitBoxId.BODY_COLLISION,
              animationState: getAnimationState(entity.entity_id)!
            })
          )
        ) {
          machine.send(TrapStateTransitions.ATTACK);
          queue.dispatch({
            type: EventNames.PLAYER_DAMAGED,
            payload: 1
          });
        }
      }
    });
  }
});
