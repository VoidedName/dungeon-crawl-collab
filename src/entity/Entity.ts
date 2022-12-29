import type { Component } from '@/entity/Components';
import {
  playerComponent,
  positionComponent,
  renderableComponent
} from '@/entity/Components';
import { pipe } from '@/fp/pipe';
import type { SpriteId } from '@/sprite/Sprite';

export type EntityId = number;
export type Entity = {
  entity_id: EntityId;
};

// mutable add
function addComponent<E extends Entity, C extends Component<any>>(
  entity: E,
  component: () => C
): E & C {
  return Object.assign(entity, component()) as E & C;
}

// mutable remove
function removeComponent<
  E extends Entity,
  C extends Exclude<keyof E, keyof Entity>
>(entity: E, component: C): Omit<E, C> {
  delete entity[component];
  return entity;
}

let entityCount = 0;

function createEntity(): Entity {
  return {
    entity_id: entityCount++
  };
}

const withPlayer =
  <E extends Entity>() =>
  (e: E) =>
    addComponent(e, playerComponent);

const withPosition =
  <E extends Entity>(x: number, y: number) =>
  (e: E) =>
    addComponent(e, () => positionComponent(x, y));

const withRenderable =
  <E extends Entity>(sprite: SpriteId) =>
  (e: E) =>
    addComponent(e, () => renderableComponent(sprite));

const player_2 = pipe(withPlayer())
  .then(withPosition(5, 2))
  .then(withRenderable(13))
  .evaluate(createEntity());
