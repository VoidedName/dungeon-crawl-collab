const entities = [];

const entityMap: Record<number, TEntity> = {};

export type TEntity = {
  id: number;
  [key: string]: any;
};

export function addEntity(entity: TEntity) {
  entities.push(entity);
  entityMap[entity.id] = entity;
}

export function getEntityById(id: number) {
  return entityMap[id];
}
