import { ecsComponent, type ECSComponent } from '@/ecs/ECSComponent';
import type { ECSEntity } from '@/ecs/ECSEntity';
import type { Size as TSize } from '@/utils/types';

export const SizeBrand = 'size';
type SizeBrand = typeof SizeBrand;
export type Size = ECSComponent<SizeBrand, TSize>;

export function hasSize<E extends ECSEntity>(e: E): e is E & Size {
  return SizeBrand in e;
}

export const sizeComponent = ecsComponent<Size>(SizeBrand);
