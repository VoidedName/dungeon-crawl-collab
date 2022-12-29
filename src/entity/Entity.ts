import type { Component } from '@/entity/Components';
import {
  playerComponent,
  positionComponent,
  renderableComponent
} from '@/entity/Components';
import { pipe } from '@/fp/pipe';

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

const player = addComponent(
  addComponent(
    addComponent(createEntity(), playerComponent),
    renderableComponent
  ),
  positionComponent
);

const player_factory = pipe((e: Entity) => addComponent(e, playerComponent))
  .then(e => addComponent(e, positionComponent))
  .then(e => addComponent(e, renderableComponent))
  .compose();

const player_2 = player_factory(createEntity());
