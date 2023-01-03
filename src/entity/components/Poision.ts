import type { ECSComponent } from '@/ecs/ECSComponent';
import { ecsComponent, has } from '@/ecs/ECSComponent';

export const PoisionBrand = 'poision';
type PoisionBrand = typeof PoisionBrand;
export type Poision = ECSComponent<
  PoisionBrand,
  {
    damage: number;
    duration: number;
    nextDamageIn: number;
  }
>;

export const hasPoision = has<Poision>('poision');
export const poisionComponent = ecsComponent<Poision>('poision');
