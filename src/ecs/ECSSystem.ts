import type { ECSComponent } from '@/ecs/ECSComponent';
import type { Intersect } from '@/utils/types';
import type { ECSEntity } from '@/ecs/ECSEntity';
import type { BrandsFromComponents } from '@/ecs/types';
import type { ECSWorld } from '@/ecs/ECSWorld';

export type ECSSystemProps = {
  readonly delta: number;
};

export interface ECSSystem<Cs extends ECSComponent<string>[]> {
  readonly target: BrandsFromComponents<Cs>;
  readonly run: (
    ecs: ECSWorld,
    props: ECSSystemProps,
    entities: (ECSEntity & Intersect<Cs>)[]
  ) => void;
}
