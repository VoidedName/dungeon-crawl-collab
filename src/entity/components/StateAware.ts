import type { ECSComponent } from '@/ecs/ECSComponent';
import { ecsComponent, has } from '@/ecs/ECSComponent';

export const StateAwareBrand = 'state_aware';
type StateAwareBrand = typeof StateAwareBrand;
export type StateAware = ECSComponent<StateAwareBrand>;
export const stateAwareComponent = ecsComponent<StateAware>(StateAwareBrand);
export const hasStateAware = has<StateAware>(StateAwareBrand);
