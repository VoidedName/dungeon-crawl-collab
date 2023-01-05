import type { ECSComponent } from '@/ecs/ECSComponent';
import { ecsComponent, has } from '@/ecs/ECSComponent';
import type { ECSEntityId } from '@/ecs/ECSEntity';
import type { Stats } from '@/utils/types';

export type ProjectileStats = {
  speed: number;
  power: number;
};

export const ProjectileBrand = 'projectile';
type ProjectileBrand = typeof ProjectileBrand;
export type Projectile = ECSComponent<
  ProjectileBrand,
  { firedBy: ECSEntityId; stats: Stats<ProjectileStats> }
>;
export const projectileComponent = ecsComponent<Projectile>('projectile');
export const hasProjectile = has<Projectile>('projectile');
