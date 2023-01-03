import type { ECSComponent } from '@/ecs/ECSComponent';
import { ecsComponent, has } from '@/ecs/ECSComponent';

export const ImmoveableBrand = 'immoveable';
type ImmoveableBrand = typeof ImmoveableBrand;
export type Immoveable = ECSComponent<ImmoveableBrand>;
export const immoveableComponent = ecsComponent<Immoveable>('immoveable');
export const hasImmoveable = has<Immoveable>('immoveable');
