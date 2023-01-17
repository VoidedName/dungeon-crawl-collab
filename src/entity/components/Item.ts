import type { ECSComponent } from '@/ecs/ECSComponent';
import { ecsComponent, has } from '@/ecs/ECSComponent';
import type { TItem } from '@/createInventoryManager';

export const ItemBrand = 'item';
type ItemBrand = typeof ItemBrand;
export type Item = ECSComponent<
  ItemBrand,
  {
    type: TItem;
  }
>;
export const itemComponent = ecsComponent<Item>('item');
export const hasItem = has<Item>('item');
