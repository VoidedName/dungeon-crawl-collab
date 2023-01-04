import type { ECSSystem } from '@/ecs/ECSSystem';
import type { DisplayObject } from 'pixi.js';
import {
  type Renderable,
  RenderableBrand
} from '@/entity/components/Renderable';
import type { ECSEntityId } from '@/ecs/ECSEntity';
import { EnemyBrand, type Enemy } from '@/entity/components/Enemy';
import { PositionBrand, type Position } from '@/entity/components/Position';
import { SizeBrand, type Size } from '@/entity/components/Size';
import { resolveStateMachine } from '@/stateMachines/stateMachineManager';
import { TrapState, TrapStateTransitions } from '@/stateMachines/trap';
import { spriteCollision } from '@/utils/collisions';
import {
  AnimatableBrand,
  type Animatable
} from '@/entity/components/Animatable';
import { EventNames, type GameLoopQueue } from '@/createGameLoop';
import { getPlayer } from '@/utils/getPlayer';

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
    const player = getPlayer(ecs);

    entities.forEach(entity => {
      if (entity.enemy.type === 'trap') {
        const machine = resolveStateMachine(entity.entity_id);
        if (
          machine.getSnapshot().value === TrapState.IDLE &&
          spriteCollision(player as any, entity)
        ) {
          machine.send(TrapStateTransitions.ATTACK);
        } else if (
          machine.getSnapshot().value === TrapState.CAN_HURT &&
          spriteCollision(player as any, entity)
        ) {
          machine.send(TrapStateTransitions.INFLICTED);
          queue.dispatch({
            type: EventNames.PLAYER_DAMAGED,
            payload: 1
          });
        }
      }
    });
  }
});
