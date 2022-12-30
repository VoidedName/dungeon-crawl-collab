import type { SpriteId } from '@/sprite/Sprite';
import type { ECSEntity } from '@/ecs/ECSEntity';
import type { ECSComponent } from '@/ecs/ECSComponent';

// TODO: Consider splitting the components apart, they're only expected to grow

export const PositionBrand = 'position';
type PositionBrand = typeof PositionBrand;
export type Position = ECSComponent<
  PositionBrand,
  {
    x: number;
    y: number;
  }
>;

export function hasPosition<E extends ECSEntity>(e: E): e is E & Position {
  return PositionBrand in e;
}

export function positionComponent(x: number, y: number): Position {
  return {
    [PositionBrand]: {
      x,
      y
    }
  };
}

export const withPosition = (x: number, y: number) => () =>
  positionComponent(x, y);

export const PlayerBrand = 'player';
type PlayerBrand = typeof PlayerBrand;
export type Player = ECSComponent<PlayerBrand>;
export function playerComponent(): Player {
  return {
    [PlayerBrand]: {}
  };
}

export function hasPlayer<E extends ECSEntity>(e: E): e is E & Player {
  return PlayerBrand in e;
}

export const withPlayer = <E extends ECSEntity>() => playerComponent;

// TODO:  Consider not doing this mutably. We probably want to update all entities at once, i.e. queue these actions
//        But this requires a abstracted ecs system that provides these actions
