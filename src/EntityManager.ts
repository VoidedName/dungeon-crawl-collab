const entities = [];

const entityMap: Record<string, TEntity> = {};

export type TEntity = {
  id: string;
  [key: string]: any;
};

export function addEntity(entity: TEntity) {
  entities.push(entity);
  entityMap[entity.id] = entity;
}

export function getEntityById(id: string) {
  return entityMap[id];
}
