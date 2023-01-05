import type { ECSComponent } from '@/ecs/ECSComponent';
import { ecsComponent, has } from '@/ecs/ECSComponent';

export const ProjectileBrand = 'projectile';
type ProjectileBrand = typeof ProjectileBrand;
export type Projectile = ECSComponent<ProjectileBrand>;
export const projectileComponent = ecsComponent<Projectile>('projectile');
export const hasProjectile = has<Projectile>('projectile');
