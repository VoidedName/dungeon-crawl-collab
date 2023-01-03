import type { ECSComponent } from '@/ecs/ECSComponent';
import { ecsComponent, has } from '@/ecs/ECSComponent';

export const PoisonBrand = 'poison';
type PoisonBrand = typeof PoisonBrand;
export type Poison = ECSComponent<
  PoisonBrand,
  {
    damage: number;
    duration: number;
    nextDamageIn: number;
  }
>;

export const hasPoison = has<Poison>('poison');
export const poisonComponent = ecsComponent<Poison>('poison');
