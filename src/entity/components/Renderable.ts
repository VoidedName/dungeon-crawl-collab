import { ecsComponent, has, type ECSComponent } from '@/ecs/ECSComponent';

export const RenderableBrand = 'renderable';
type RenderableBrand = typeof RenderableBrand;
export type Renderable = ECSComponent<RenderableBrand>;
export const renderableComponent = ecsComponent<Renderable>(RenderableBrand);
export const hasPlayer = has<Renderable>(RenderableBrand);
