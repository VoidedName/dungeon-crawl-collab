import type { SpriteId } from '@/sprite/Sprite';

export type Component<T extends string, Props = object> = {
  [key in T]: { __brand__: T } & Props;
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

export function positionComponent(): Position {
  return {
    [PositionBrand]: {
      __brand__: PositionBrand,
      x: 0,
      y: 0
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

export function renderableComponent(): Renderable {
  return {
    [RenderableBrand]: {
      __brand__: RenderableBrand,
      sprite: 42
    }
  };
}

const PlayerBrand = 'player';
type PlayerBrand = typeof PlayerBrand;
export type Player = Component<PlayerBrand>;

export function playerComponent(): Player {
  return {
    [PlayerBrand]: {
      __brand__: PlayerBrand
    }
  };
}
