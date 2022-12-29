export type EntityId = number;
export type Entity = {
  entity_id: EntityId;
};

let entityCount = 0;

// TODO: Generalize this
export function createEntity(): Entity {
  return {
    entity_id: entityCount++
  };
}
