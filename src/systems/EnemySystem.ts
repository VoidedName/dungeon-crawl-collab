import type { ECSSystem } from '@/ecs/ECSSystem';
import type { DisplayObject } from 'pixi.js';
import {
  type Renderable,
  RenderableBrand
} from '@/entity/components/Renderable';
import type { ECSEntityId } from '@/ecs/ECSEntity';
import { getPlayer } from '@/utils/getPlayer';
import { EnemyBrand, type Enemy } from '@/entity/components/Enemy';
import { spriteCollision } from '@/utils/collisions';
import { PositionBrand, type Position } from '@/entity/components/Position';
import { SizeBrand, type Size } from '@/entity/components/Size';
import { resolveStateMachine } from '@/stateMachines/stateMachineManager';
import {
  TrapReadyState,
  TrapState,
  TrapStateTransitions
} from '@/stateMachines/trap';
import {
  AnimatableBrand,
  type Animatable
} from '@/entity/components/Animatable';
import { isObject } from '@/utils/assertions';
import { type GameLoopQueue, EventNames } from '@/events/createEventQueue';

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
        if (!spriteCollision(player as any, entity)) return;

        const state = machine.getSnapshot().value;

        if (state === TrapState.IDLE) {
          machine.send(TrapStateTransitions.TRIGGER);
        } else if (
          isObject(state) &&
          state[TrapState.READY] === TrapReadyState.CAN_REACH_PLAYER
        ) {
          machine.send(TrapStateTransitions.REACHED_PLAYER);

          queue.dispatch({
            type: EventNames.DAMAGE,
            payload: {
              damage: 1,
              entityId: player.entity_id
            }
          });
        }
      }
    });
  }
});
