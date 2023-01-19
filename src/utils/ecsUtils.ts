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
import { getPlayer } from './getPlayer';

export const getStats = <T extends PlayerStats | ProjectileStats | EnemyStats>(
  entity: ECSEntity & (Player | Enemy | Projectile)
) => {
  if (hasPlayer(entity)) return entity.player.stats as Stats<T>;
  if (hasEnemy(entity)) return entity.enemy.stats as Stats<T>;
  if (hasProjectile(entity)) return entity.projectile.stats as Stats<T>;

  throw new Error('Trying to get stats from unelligible entity');
};

export const removeProjectile = (
  e: ECSEntity & Animatable & Projectile,
  world: ECSWorld
) => {
  const machine = resolveStateMachine(e.entity_id);
  machine.send(ProjectileStateTransitions.DIE);
  setTimeout(() => {
    world.addComponent(e.entity_id, deleteComponent);
  }, getAnimationDuration(e.animatable.spriteName, AnimationState.DEAD));
};

export const addExperience = (to: ECSEntity & Enemy, ecs: ECSWorld) => {
  const {
    player: { stats }
  } = getPlayer(ecs);
  const experienceGain = 10; // temporary, needs to add heuristics too compute exp gain, from enemy type, level, player level, etc...
  const newExperienceCap = stats.current.experienceToNextLevel * 1.2; //same thing

  stats.current.experience += experienceGain;
  const isLevelUp =
    stats.current.experience < stats.current.experienceToNextLevel;

  if (!isLevelUp) return;

  stats.current.level++;
  stats.current.experience =
    stats.current.experience % stats.current.experienceToNextLevel;
  stats.current.experienceToNextLevel = newExperienceCap;
};
