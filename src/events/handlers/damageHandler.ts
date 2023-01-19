import type { TAudioManager } from '@/createAudioManager';
import { flashRed } from '@/createEffectManager';
import type { ECSEntityId } from '@/ecs/ECSEntity';
import type { ECSWorld } from '@/ecs/ECSWorld';
import { deleteComponent } from '@/entity/components/Delete';
import {
  hasEnemy,
  type EnemyStats,
  EnemyType
} from '@/entity/components/Enemy';
import { hasPlayer, type PlayerStats } from '@/entity/components/Player';
import { getStats } from '@/utils/ecsUtils';
import type { ECSEmitter } from '../createExternalQueue';
import { clamp } from '@/utils/math';
import { hasPosition } from '@/entity/components/Position';
import { createRandomItem } from '@/entity/factories/createRandomItem';
import { resolveStateMachine } from '@/stateMachines/stateMachineManager';
import { PlayerStateTransitions } from '@/stateMachines/player';
import { TrapStateTransitions } from '@/stateMachines/trap';
import { EventNames, type GameLoopQueue } from '../createEventQueue';

export const damageHandler = (
  options: {
    damage: number;
    entityId: ECSEntityId;
  },
  world: ECSWorld,
  emit: ECSEmitter,
  queue: GameLoopQueue
) => {
  const target = world.getEntity(options.entityId).unwrap();

  if (!hasPlayer(target) && !hasEnemy(target)) {
    console.warn('trying to damage a non damageable entity. Skipping.');
    return;
  }

  const stats = getStats<PlayerStats | EnemyStats>(target);

  stats.current.health = clamp(
    stats.current.health - options.damage,
    0,
    stats.base.health
  );

  world.get<TAudioManager>('audio').unwrap().play('damage');

  if (stats.current.health <= 0) {
    world.addComponent(target, deleteComponent);

    if (hasPosition(target)) {
      createRandomItem(world, {
        position: target.position
      });
    }
    // if (hasEnemy(to)) {
    //   addExperience(to, ecs);
    // }
  } else {
    const machine = resolveStateMachine(target.entity_id);
    if (hasPlayer(target)) {
      machine.send(PlayerStateTransitions.TAKE_DAMAGE);
    }
    if (hasEnemy(target) && target.enemy.type === EnemyType.TRAP) {
      machine.send(TrapStateTransitions.TAKE_DAMAGE);
    }
  }

  if (hasPlayer(target)) {
    emit('playerUpdate');
  } else if (hasEnemy(target)) {
    world.get<TAudioManager>('audio').unwrap().play('damage');
  }

  if (stats.current.health <= 0) {
    queue.dispatch({ type: EventNames.ENTITY_DIED, payload: target.entity_id });
  }

  flashRed(target.entity_id);
};
