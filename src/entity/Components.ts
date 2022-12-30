import type { SpriteId } from '@/sprite/Sprite';
import type { ECSEntity } from '@/ecs/ECSEntity';
import type { ECSComponent } from '@/ecs/ECSComponent';

// TODO: Consider splitting the components apart, they're only expected to grow

const PositionBrand = 'position';
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

export const withPosition =
  <E extends ECSEntity>(x: number, y: number) =>
  (e: E) =>
    addComponent(e, () => positionComponent(x, y));

const RenderableBrand = 'renderable';
type RenderableBrand = typeof RenderableBrand;
export type Renderable = ECSComponent<
  RenderableBrand,
  {
    sprite: SpriteId;
  }
>;

export function hasRenderable<E extends ECSEntity>(e: E): e is E & Renderable {
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
  <E extends ECSEntity>(sprite: SpriteId) =>
  (e: E) =>
    addComponent(e, () => renderableComponent(sprite));

const PlayerBrand = 'player';
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

export const withPlayer =
  <E extends ECSEntity>() =>
  (e: E) =>
    addComponent(e, playerComponent);

// TODO:  Consider not doing this mutably. We probably want to update all entities at once, i.e. queue these actions
//        But this requires a abstracted ecs system that provides these actions

/**
 * Mutably changes the entity by adding the component to it
 */
export function addComponent<E extends ECSEntity, C extends ECSComponent<any>>(
  entity: E,
  component: () => C
): E & C {
  return Object.assign(entity, component()) as E & C;
}

/**
 * Mutably changes the entity by removing the component from it
 */
export function removeComponent<
  E extends ECSEntity,
  C extends Exclude<keyof E, keyof ECSEntity>
>(entity: E, component: C): Omit<E, C> {
  delete entity[component];
  return entity;
}
