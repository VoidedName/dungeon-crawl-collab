import type { SpriteId } from '@/sprite/Sprite';

export type Component<T extends string, Props extends object = object> = {
  [key in T]: Props;
};

const PositionBrand = 'position';
type PositionBrand = typeof PositionBrand;
export type Position = Component<
  PositionBrand,
  {
    x: number;
    y: number;
  }
>;

export function positionComponent(x: number, y: number): Position {
  return {
    [PositionBrand]: {
      x,
      y
    }
  };
}

const RenderableBrand = 'renderable';
type RenderableBrand = typeof RenderableBrand;
export type Renderable = Component<
  RenderableBrand,
  {
    sprite: SpriteId;
  }
>;

export function renderableComponent(sprite: SpriteId): Renderable {
  return {
    [RenderableBrand]: {
      sprite
    }
  };
}

const PlayerBrand = 'player';
type PlayerBrand = typeof PlayerBrand;
export type Player = Component<PlayerBrand>;

export function playerComponent(): Player {
  return {
    [PlayerBrand]: {}
  };
}
