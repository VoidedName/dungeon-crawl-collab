import type { ECSComponent } from '@/ecs/ECSComponent';

export type BrandsFromComponents<C extends ECSComponent<any>[]> = {
  [Key in keyof C]: C[Key] extends ECSComponent<infer Brand> ? Brand : never;
};
