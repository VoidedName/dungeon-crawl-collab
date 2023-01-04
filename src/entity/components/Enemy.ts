import type { ECSComponent } from '@/ecs/ECSComponent';
import { ecsComponent, has } from '@/ecs/ECSComponent';

export const enemies = ['trap'] as const;
export type Enemies = typeof enemies[number];

export const EnemyBrand = 'enemy';
type EnemyBrand = typeof EnemyBrand;
export type Enemy = ECSComponent<
  EnemyBrand,
  {
    type: Enemies;
  }
>;
export const enemyComponent = ecsComponent<Enemy>('enemy');
export const hasEnemy = has<Enemy>('enemy');
