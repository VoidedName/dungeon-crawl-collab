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
import { TrapState, TrapStateTransitions } from '@/stateMachines/trap';
import {
  AnimatableBrand,
  type Animatable
} from '@/entity/components/Animatable';
import { EventNames, type GameLoopQueue } from '@/createGameLoop';
import { isObject } from '@/utils/assertions';

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
        if (machine.getSnapshot().value === TrapState.IDLE) {
          machine.send(TrapStateTransitions.ATTACK);
        } else if (
          isObject(machine.getSnapshot().value) &&
          (machine.getSnapshot().value as any)[TrapState.DAMAGEABLE] !==
            TrapState.USED
        ) {
          machine.send(TrapStateTransitions.USED);
          queue.dispatch({
            type: EventNames.PLAYER_DAMAGED,
            payload: 1
          });
        }
      }
    });
  }
});
