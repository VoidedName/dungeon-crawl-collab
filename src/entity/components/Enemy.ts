import type { ECSComponent } from '@/ecs/ECSComponent';
import { ecsComponent, has } from '@/ecs/ECSComponent';
import type { Stats } from '@/utils/types';

export type EnemyStats = {
  speed: number;
  health: number;
};

export const enemies = ['trap'] as const;
export type Enemies = typeof enemies[number];

export const EnemyBrand = 'enemy';
type EnemyBrand = typeof EnemyBrand;
export type Enemy = ECSComponent<
  EnemyBrand,
  {
    type: Enemies;
    stats: Stats<EnemyStats>;
  }
>;
export const enemyComponent = ecsComponent<Enemy>('enemy');
export const hasEnemy = has<Enemy>('enemy');
