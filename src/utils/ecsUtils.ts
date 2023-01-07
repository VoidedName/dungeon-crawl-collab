import {
  type EnemyStats,
  type Enemy,
  hasEnemy,
  EnemyType
} from '@/entity/components/Enemy';
import {
  type PlayerStats,
  type Player,
  hasPlayer
} from '@/entity/components/Player';
import {
  AnimationState,
  type Animatable
} from '@/entity/components/Animatable';
import type { Stats } from './types';
import { clamp } from './math';
import type { ECSEntity } from '@/ecs/ECSEntity';
import {
  hasProjectile,
  type Projectile,
  type ProjectileStats
} from '@/entity/components/Projectile';
import type { ECSWorld } from '@/ecs/ECSWorld';
import { deleteComponent } from '@/entity/components/Delete';
import { resolveStateMachine } from '@/stateMachines/stateMachineManager';
import { ProjectileStateTransitions } from '@/stateMachines/projectile';
import { getAnimationDuration } from '@/renderer/renderableUtils';
import { TrapStateTransitions } from '@/stateMachines/trap';
import { PlayerStateTransitions } from '@/stateMachines/player';
import type { TAudioManager } from '@/createAudioManager';

export const getStats = <T extends PlayerStats | ProjectileStats | EnemyStats>(
  entity: ECSEntity & (Player | Enemy | Projectile)
) => {
  if (hasPlayer(entity)) return entity.player.stats as Stats<T>;
  if (hasEnemy(entity)) return entity.enemy.stats as Stats<T>;
  if (hasProjectile(entity)) return entity.projectile.stats as Stats<T>;

  throw new Error('Trying to get stats from unelligible entity');
};

export const dealDamage = ({
  to,
  amount,
  ecs
}: {
  to: ECSEntity & (Player | Enemy);
  amount: number;
  ecs: ECSWorld;
}) => {
  const stats = getStats<PlayerStats | EnemyStats>(to);

  stats.current.health = clamp(
    stats.current.health - amount,
    0,
    stats.base.health
  );

  ecs.get<TAudioManager>('audio').unwrap().play('damage');

  if (stats.current.health <= 0) {
    ecs.addComponent(to, deleteComponent);
  } else {
    const machine = resolveStateMachine(to.entity_id);
    if (hasPlayer(to)) {
      machine.send(PlayerStateTransitions.TAKE_DAMAGE);
    }
    if (hasEnemy(to) && to.enemy.type === EnemyType.TRAP) {
      machine.send(TrapStateTransitions.TAKE_DAMAGE);
    }
  }
};

export const removeProjectile = (
  e: ECSEntity & Animatable & Projectile,
  ecs: ECSWorld
) => {
  const machine = resolveStateMachine(e.entity_id);
  machine.send(ProjectileStateTransitions.DIE);
  setTimeout(() => {
    ecs.addComponent(e.entity_id, deleteComponent);
  }, getAnimationDuration(e.animatable.spriteName, AnimationState.DEAD));
};
