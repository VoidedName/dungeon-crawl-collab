import type { ECSComponent } from '@/ecs/ECSComponent';
import { ecsComponent, has } from '@/ecs/ECSComponent';
import type { ECSEntity } from '@/ecs/ECSEntity';

export const ParentBrand = 'parent';
type ParentBrand = typeof ParentBrand;
export type Parent = ECSComponent<
  ParentBrand,
  {
    entity: ECSEntity;
  }
>;
export const parentComponent = ecsComponent<Parent>('parent');
export const hasParent = has<Parent>('parent');
