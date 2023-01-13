import type { ECSComponent } from '@/ecs/ECSComponent';
import { ecsComponent, has } from '@/ecs/ECSComponent';
import type { ECSEntityId } from '@/ecs/ECSEntity';

export type PathingTo = ECSComponent<'pathing_to', { target: ECSEntityId }>;
export const pathingTo = ecsComponent<PathingTo>('pathing_to');
export const hasPathingTo = has<PathingTo>('pathing_to');
