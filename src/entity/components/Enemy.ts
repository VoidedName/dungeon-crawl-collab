import type { ECSComponent } from '@/ecs/ECSComponent';
import { ecsComponent, has } from '@/ecs/ECSComponent';
import type { Stats, Values } from '@/utils/types';

export type EnemyStats = {
  speed: number;
  health: number;
  attack: number;
};

export const EnemyType = {
  TRAP: 'trap'
};
export type EnemyType = Values<typeof EnemyType>;

export const EnemyBrand = 'enemy';
type EnemyBrand = typeof EnemyBrand;
export type Enemy = ECSComponent<
  EnemyBrand,
  {
    type: EnemyType;
    stats: Stats<EnemyStats>;
  }
>;
export const enemyComponent = ecsComponent<Enemy>('enemy');
export const hasEnemy = has<Enemy>('enemy');
