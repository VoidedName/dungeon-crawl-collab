import type { ECSComponent } from '@/ecs/ECSComponent';
import { ecsComponent, has } from '@/ecs/ECSComponent';

export const DeleteBrand = 'delete';
type DeleteBrand = typeof DeleteBrand;
export type Delete = ECSComponent<DeleteBrand>;
export const deleteComponent = ecsComponent<Delete>('delete');
export const hasDelete = has<Delete>('delete');
