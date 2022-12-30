import type { ECSComponent } from '@/ecs/ECSComponent';
import type { Intersect } from '@/utils/types';
import type { ECSEntity } from '@/ecs/ECSEntity';
import type { BrandsFromComponents } from '@/ecs/types';

export interface ECSSystem<Cs extends ECSComponent<any>[]> {
  readonly target: BrandsFromComponents<Cs>;
  readonly run: (entities: (ECSEntity & Intersect<Cs>)[]) => void;
}
