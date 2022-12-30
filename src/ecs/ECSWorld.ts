import type { ECSEntity, ECSEntityId } from '@/ecs/ECSEntity';
import type { ECSComponent } from '@/ecs/ECSComponent';
import { pipe } from '@/fp/pipe';
import type { Intersect } from '@/utils/types';
import type { BrandsFromComponents } from '@/ecs/types';
import type { ECSSystem } from '@/ecs/ECSSystem';

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

export type ECSEntityBuilder<T extends ECSEntity> = {
  with<C extends ECSComponent<any>>(
    component: () => C
  ): ECSEntityBuilder<T & C>;
  build(): T;
};

function entityBuilder<T extends ECSEntity>(
  internals: ECSInternals,
  build = pipe<ECSEntity, T>((e: ECSEntity) => e as T)
): ECSEntityBuilder<T> {
  return {
    with<C extends ECSComponent<any>>(
      component: () => C
    ): ECSEntityBuilder<T & C> {
      return entityBuilder(
        internals,
        build.then(e => addComponent(e, component))
      );
    },
    build(): T {
      const e = build.evaluate({ entity_id: internals.nextEntityId++ } as T);
      type exclude = keyof ECSEntity;
      // add to entities
      internals.entities.set(e.entity_id, e);

      // add to component trackers
      Object.keys(e).forEach(key => {
        if (key !== ('entity_id' satisfies exclude)) {
          const set = internals.entityByComponent.get(key) ?? new Set();
          set.add(e.entity_id);
          internals.entityByComponent.set(key, set);
        }
      });
      // add to system trackers
      internals.systems.forEach(([name, system]) => {
        if (system.target.every(brand => brand in e)) {
          internals.entitiesBySystem.get(name)!.add(e.entity_id);
        }
      });
      return e;
    }
  };
}

/**
 * The world the ECS lives in.
 * It basically represents an ECS instance and all interactions with the ECS
 * should go through this object.
 */
export interface ECSWorld {
  createEntity(): ECSEntityBuilder<ECSEntity>;

  deleteEntity(e: ECSEntityId): void;
  deleteEntity(e: ECSEntity): void;

  addComponent<C extends ECSComponent<any>>(
    e: ECSEntityId,
    component: () => C
  ): (ECSEntity & C) | undefined;
  addComponent<E extends ECSEntity, C extends ECSComponent<any>>(
    e: E,
    component: () => C
  ): E & C;

  removeComponent<C extends ECSComponent<any>>(
    entity: ECSEntityId,
    component: C extends ECSComponent<infer S> ? S : never
  ): ECSEntity | undefined;
  removeComponent<E extends ECSEntity, C extends ECSComponent<any>>(
    entity: E,
    component: C extends ECSComponent<infer S> ? S : never
  ): Omit<E, keyof C>;

  entitiesByComponent<C extends ECSComponent<any>[]>(
    keys: BrandsFromComponents<C>
  ): (ECSEntity & Intersect<C>)[];

  addSystem<T extends ECSComponent<any>[]>(
    name: string,
    system: ECSSystem<T>
  ): void;

  removeSystem(name: string): void;

  runSystems(): void;
}

// todo systems
// todo entity management
/**
 * Track internal state of the ECS, things like next entity id, the entities, etc
 */
type ECSInternals = {
  entities: Map<ECSEntityId, ECSEntity>;
  entityByComponent: Map<string, Set<ECSEntityId>>;
  nextEntityId: ECSEntityId;
  systems: [string, ECSSystem<any>][];
  entitiesBySystem: Map<string, Set<ECSEntityId>>;
};

function createInternals(): ECSInternals {
  return {
    entityByComponent: new Map<string, Set<ECSEntityId>>(),
    entities: new Map<ECSEntityId, ECSEntity>(),
    nextEntityId: 0,
    systems: [],
    entitiesBySystem: new Map<string, Set<ECSEntityId>>()
  };
}
function getEntity<E extends ECSEntity>(
  internals: ECSInternals,
  e: E | ECSEntityId
): E | undefined {
  return typeof e === 'number'
    ? (internals.entities.get(e) as E | undefined)
    : e;
}

function internalCreateEntity(
  internals: ECSInternals
): ECSWorld['createEntity'] {
  function createEntity(): ECSEntityBuilder<ECSEntity> {
    return entityBuilder(internals);
  }

  return createEntity;
}

function internalDeleteEntity(
  internals: ECSInternals
): ECSWorld['deleteEntity'] {
  function deleteEntity(e: ECSEntityId): void;
  function deleteEntity(e: ECSEntity): void;
  function deleteEntity(e: ECSEntity | ECSEntityId): void {
    const id = typeof e === 'number' ? e : e.entity_id;
    // drop entity
    internals.entities.delete(id);

    // remove from components
    for (const component of internals.entityByComponent.values()) {
      component.delete(id);
    }

    // remove from systems
    for (const system of internals.entitiesBySystem.values()) {
      system.delete(id);
    }
  }
  return deleteEntity;
}

function internalAddComponent(
  internals: ECSInternals
): ECSWorld['addComponent'] {
  function addComponent<C extends ECSComponent<any>>(
    e: ECSEntityId,
    component: () => C
  ): (ECSEntity & C) | undefined;
  function addComponent<E extends ECSEntity, C extends ECSComponent<any>>(
    e: E,
    component: () => C
  ): E & C;
  function addComponent<E extends ECSEntity, C extends ECSComponent<any>>(
    e: E | ECSEntityId,
    component: () => C
  ): (E & C) | ((ECSEntity & C) | undefined) {
    const entity: E | undefined = getEntity(internals, e);
    if (entity === undefined) return undefined;

    const c = component();
    const brand = Object.keys(c)[0]!;

    // update entity
    Object.assign(entity, c);

    // add to components
    const set = internals.entityByComponent.get(brand) ?? new Set();
    set.add(entity.entity_id);
    internals.entityByComponent.set(brand, set);

    // add to systems
    internals.systems.forEach(([name, system]) => {
      if (system.target.every(k => k in entity)) {
        internals.entitiesBySystem.get(name)!.add(entity.entity_id);
      }
    });

    return entity as (E & C) | (ECSEntity & C);
  }
  return addComponent;
}

function internalRemoveComponents(
  internals: ECSInternals
): ECSWorld['removeComponent'] {
  function removeComponent<C extends ECSComponent<any>>(
    entity: ECSEntityId,
    component: C extends ECSComponent<infer S> ? S : never
  ): ECSEntity | undefined;
  function removeComponent<E extends ECSEntity, C extends ECSComponent<any>>(
    entity: E,
    component: C extends ECSComponent<infer S> ? S : never
  ): Omit<E, keyof C>;
  function removeComponent<
    E extends ECSEntity,
    C extends string & Exclude<keyof E, keyof ECSEntity>
  >(
    entity: E | ECSEntityId,
    component: C
  ): Omit<E, keyof C> | ECSEntity | undefined {
    const e: E | undefined = getEntity(internals, entity);
    if (e === undefined) return undefined;
    // update entity
    delete e[component];

    // update components
    internals.entitiesBySystem.get(component)?.delete(e.entity_id);

    // update systems
    internals.systems.forEach(([name, system]) => {
      if (system.target.some(k => k === component)) {
        internals.entitiesBySystem.get(name)!.delete(e.entity_id);
      }
    });

    return e as Omit<E, keyof C> | ECSEntity;
  }

  return removeComponent;
}

function internalEntitiesByComponent(
  internals: ECSInternals
): ECSWorld['entitiesByComponent'] {
  function entitiesByComponent<C extends ECSComponent<any>[]>(
    keys: BrandsFromComponents<C>
  ): (ECSEntity & Intersect<C>)[] {
    if (keys.length === 0) return [];
    const entitySets = keys.map(
      key => internals.entityByComponent.get(key) ?? new Set<ECSEntityId>()
    );
    const entities: (ECSEntity & Intersect<C>)[] = [];
    for (const e of entitySets[0]!) {
      if (entitySets.every(s => s.has(e)))
        entities.push(internals.entities.get(e)! as ECSEntity & Intersect<C>);
    }
    return entities;
  }

  return entitiesByComponent;
}

function internalAddSystem(internals: ECSInternals): ECSWorld['addSystem'] {
  const entitiesByComponent = internalEntitiesByComponent(internals);
  function addSystem<T extends ECSComponent<any>[]>(
    name: string,
    system: ECSSystem<T>
  ) {
    if (internals.entitiesBySystem.has(name))
      throw new Error(
        `A system under the name '${name}' is already registered!`
      );

    internals.systems.push([name, system]);
    const targets = entitiesByComponent(system.target);
    internals.entitiesBySystem.set(
      name,
      new Set(targets.map(e => e.entity_id))
    );
  }
  return addSystem;
}

function internalRemoveSystem(
  internals: ECSInternals
): ECSWorld['removeSystem'] {
  function removeSystem(name: string): void {
    internals.systems = internals.systems.filter(([n]) => n !== name);
    internals.entitiesBySystem.delete(name);
  }
  return removeSystem;
}

function internalRunSystem(internals: ECSInternals): ECSWorld['runSystems'] {
  function runSystems() {
    internals.systems.forEach(([name, system]) => {
      const entities = [
        ...(internals.entitiesBySystem.get(name)?.values() ?? [])
      ]
        .map(e => internals.entities.get(e))
        .filter(e => e !== undefined) as ECSEntity[];
      system.run(entities as any); // this any is intentional
    });
  }
  return runSystems;
}

// we would add systems to the world as well, and optimise them (then need static access)
export function createWorld(): ECSWorld {
  const internals = createInternals();

  return {
    createEntity: internalCreateEntity(internals),
    deleteEntity: internalDeleteEntity(internals),
    addComponent: internalAddComponent(internals),
    removeComponent: internalRemoveComponents(internals),
    entitiesByComponent: internalEntitiesByComponent(internals),
    addSystem: internalAddSystem(internals),
    removeSystem: internalRemoveSystem(internals),
    runSystems: internalRunSystem(internals)
  };
}
