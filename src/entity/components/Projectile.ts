import type { ECSComponent } from '@/ecs/ECSComponent';
import { ecsComponent, has } from '@/ecs/ECSComponent';
import type { ECSEntityId } from '@/ecs/ECSEntity';

export const ProjectileBrand = 'projectile';
type ProjectileBrand = typeof ProjectileBrand;
export type Projectile = ECSComponent<
  ProjectileBrand,
  { firedBy: ECSEntityId }
>;
export const projectileComponent = ecsComponent<Projectile>('projectile');
export const hasProjectile = has<Projectile>('projectile');
