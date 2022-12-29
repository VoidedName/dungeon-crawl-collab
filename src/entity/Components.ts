import type { SpriteId } from '@/sprite/Sprite';
import type { Entity } from '@/entity/Entity';

export type Component<T extends string, Props extends object = object> = {
  [key in T]: Props;
};

// TODO: Consider splitting the components apart, they're only expected to grow

const PositionBrand = 'position';
type PositionBrand = typeof PositionBrand;
export type Position = Component<
  PositionBrand,
  {
    x: number;
    y: number;
  }
>;

export function hasPosition<E extends Entity>(e: E): e is E & Position {
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

export const withPosition =
  <E extends Entity>(x: number, y: number) =>
  (e: E) =>
    addComponent(e, () => positionComponent(x, y));

const RenderableBrand = 'renderable';
type RenderableBrand = typeof RenderableBrand;
export type Renderable = Component<
  RenderableBrand,
  {
    sprite: SpriteId;
  }
>;

export function hasRenderable<E extends Entity>(e: E): e is E & Renderable {
  return RenderableBrand in e;
}

export function renderableComponent(sprite: SpriteId): Renderable {
  return {
    [RenderableBrand]: {
      sprite
    }
  };
}

export const withRenderable =
  <E extends Entity>(sprite: SpriteId) =>
  (e: E) =>
    addComponent(e, () => renderableComponent(sprite));

const PlayerBrand = 'player';
type PlayerBrand = typeof PlayerBrand;
export type Player = Component<PlayerBrand>;
export function playerComponent(): Player {
  return {
    [PlayerBrand]: {}
  };
}

export function hasPlayer<E extends Entity>(e: E): e is E & Player {
  return PlayerBrand in e;
}

export const withPlayer =
  <E extends Entity>() =>
  (e: E) =>
    addComponent(e, playerComponent);

// mutable add
export function addComponent<E extends Entity, C extends Component<any>>(
  entity: E,
  component: () => C
): E & C {
  return Object.assign(entity, component()) as E & C;
}

// mutable remove
export function removeComponent<
  E extends Entity,
  C extends Exclude<keyof E, keyof Entity>
>(entity: E, component: C): Omit<E, C> {
  delete entity[component];
  return entity;
}
