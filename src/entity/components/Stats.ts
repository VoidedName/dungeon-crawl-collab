import type { ECSComponent } from '@/ecs/ECSComponent';
import type { ECSEntity } from '@/ecs/ECSEntity';

export type StatsDescriptors = {
  speed: number;
};

export type EntityStats = {
  base: StatsDescriptors;
  current: StatsDescriptors;
};

export const StatsBrand = 'stats';
type StatsBrand = typeof StatsBrand;
export type Stats = ECSComponent<StatsBrand, EntityStats>;

export function hasStats<E extends ECSEntity>(e: E): e is E & Stats {
  return StatsBrand in e;
}

export const withStats = (baseStats: StatsDescriptors) => (): Stats => ({
  [StatsBrand]: {
    base: baseStats,
    current: baseStats
  }
});
