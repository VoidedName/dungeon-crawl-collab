export type ECSEntityId = number;
/**
 * An entity, is at its core, just an id.
 *
 * Various components can be associated / disassociated with / from the entity
 * via the addComponent / removeComponent functions
 */
export type ECSEntity = {
  entity_id: ECSEntityId;
};
