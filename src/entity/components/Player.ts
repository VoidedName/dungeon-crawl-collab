import type { ECSComponent } from '@/ecs/ECSComponent';
import type { ECSEntity } from '@/ecs/ECSEntity';

export const PlayerBrand = 'player';
type PlayerBrand = typeof PlayerBrand;
export type Player = ECSComponent<
  PlayerBrand,
  {
    level: number;
  }
>;
export function playerComponent(): Player {
  return {
    [PlayerBrand]: {
      level: 0
    }
  };
}

export function hasPlayer<E extends ECSEntity>(e: E): e is E & Player {
  return PlayerBrand in e;
}

export const withPlayer = () => playerComponent;
