export type EntityId = number;
/**
 * An entity, is at its core, just an id.
 *
 * Various components can be associated / disassociated with / from the entity
 * via the addComponent / removeComponent functions
 */
export type ECSEntity = {
  entity_id: EntityId;
};

let entityCount = 0;

// TODO: Generalize this
export function createEntity(): ECSEntity {
  return {
    entity_id: entityCount++
  };
}
