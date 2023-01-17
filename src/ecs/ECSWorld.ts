import type { ECSEntity, ECSEntityId } from '@/ecs/ECSEntity';
import type { ECSComponent } from '@/ecs/ECSComponent';
import { pipe } from '@/fp/pipe';
import type { Intersect } from '@/utils/types';
import type { BrandsFromComponents } from '@/ecs/types';
import type { ECSSystem, ECSSystemProps } from '@/ecs/ECSSystem';
import type { Maybe } from '@/utils/Maybe';
import { none, some } from '@/utils/Maybe';

/**
 * Mutably changes the entity by adding the component to it
 */
function addComponent<E extends ECSEntity, C extends ECSComponent<string>>(
  entity: E,
  component: () => C
): E & C {
  return Object.assign(entity, component()) as E & C;
}

/**
 * Mutably changes the entity by removing the component from it
 */
function removeComponent<
  E extends ECSEntity,
  C extends Exclude<keyof E, keyof ECSEntity>
>(entity: E, component: C): Omit<E, C> {
  delete entity[component];
  return entity;
}

export type ECSEntityBuilder<T extends ECSEntity> = {
  with<C extends ECSComponent<string>>(
    component: () => C
  ): ECSEntityBuilder<T & C>;
  build(): T;
};

function entityBuilder<T extends ECSEntity>(
  internals: ECSInternals,
  build = pipe<ECSEntity, T>((e: ECSEntity) => e as T)
): ECSEntityBuilder<T> {
  return {
    with<C extends ECSComponent<string>>(
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
  entities(): Iterable<ECSEntity>;
  getEntity<E extends ECSEntity>(id: ECSEntityId): Maybe<E>;

  addComponent<C extends ECSComponent<string>>(
    e: ECSEntityId,
    component: () => C
  ): (ECSEntity & C) | undefined;
  addComponent<C extends ECSComponent<string>, E extends ECSEntity = ECSEntity>(
    e: E,
    component: () => C
  ): E & C;

  removeComponent<C extends ECSComponent<string>>(
    entity: ECSEntityId,
    component: C extends ECSComponent<infer S> ? S : never
  ): ECSEntity | undefined;
  removeComponent<
    C extends ECSComponent<string>,
    E extends ECSEntity = ECSEntity
  >(
    entity: E,
    component: C extends ECSComponent<infer S> ? S : never
  ): Omit<E, keyof C>;

  entitiesByComponent<C extends ECSComponent<string>[]>(
    keys: BrandsFromComponents<C>
  ): Array<ECSEntity & Intersect<C>>;

  addSystem<T extends ECSComponent<string>[]>(
    name: string,
    system: ECSSystem<T>
  ): void;

  removeSystem(name: string): void;

  runSystems(props: ECSSystemProps): void;

  /**
   * Sets a global with "name"
   */
  set(name: string, global: any): void;

  /**
   * Gets a global with "name"
   */
  get<T>(name: string): Maybe<T>;

  /**
   * Deletes a global with "name"
   */
  delete(name: string): void;

  globals(): Iterable<[string, any]>;
}

/**
 * Track internal state of the ECS, things like next entity id, the entities, etc
 */
type ECSInternals = {
  entities: Map<ECSEntityId, ECSEntity>;
  entityByComponent: Map<string, Set<ECSEntityId>>;
  nextEntityId: ECSEntityId;
  systems: [string, ECSSystem<any>][];
  entitiesBySystem: Map<string, Set<ECSEntityId>>;
  globals: Map<string, any>;
};

function createInternals(): ECSInternals {
  return {
    entityByComponent: new Map<string, Set<ECSEntityId>>(),
    entities: new Map<ECSEntityId, ECSEntity>(),
    nextEntityId: 0,
    systems: [],
    entitiesBySystem: new Map<string, Set<ECSEntityId>>(),
    globals: new Map<string, any>()
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
  ecs: () => ECSWorld,
  internals: ECSInternals
): ECSWorld['createEntity'] {
  function createEntity(): ECSEntityBuilder<ECSEntity> {
    return entityBuilder(internals);
  }

  return createEntity;
}

function internalDeleteEntity(
  ecs: () => ECSWorld,
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

function internalEntities(
  ecs: () => ECSWorld,
  internals: ECSInternals
): ECSWorld['entities'] {
  function entities(): Iterable<ECSEntity> {
    return internals.entities.values();
  }
  return entities;
}

function internalGetEntity(
  ecs: () => ECSWorld,
  internals: ECSInternals
): ECSWorld['getEntity'] {
  function getEntity<E extends ECSEntity>(id: ECSEntityId): Maybe<E> {
    if (internals.entities.has(id))
      return some(internals.entities.get(id) as E);
    return none();
  }
  return getEntity;
}

function internalAddComponent(
  ecs: () => ECSWorld,
  internals: ECSInternals
): ECSWorld['addComponent'] {
  function addComponent<C extends ECSComponent<string>>(
    e: ECSEntityId,
    component: () => C
  ): (ECSEntity & C) | undefined;
  function addComponent<E extends ECSEntity, C extends ECSComponent<string>>(
    e: E,
    component: () => C
  ): E & C;
  function addComponent<E extends ECSEntity, C extends ECSComponent<string>>(
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
  ecs: () => ECSWorld,
  internals: ECSInternals
): ECSWorld['removeComponent'] {
  function removeComponent<C extends ECSComponent<string>>(
    entity: ECSEntityId,
    component: C extends ECSComponent<infer S> ? S : never
  ): ECSEntity | undefined;
  function removeComponent<E extends ECSEntity, C extends ECSComponent<string>>(
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
    internals.entityByComponent.get(component)?.delete(e.entity_id);

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
  ecs: () => ECSWorld,
  internals: ECSInternals
): ECSWorld['entitiesByComponent'] {
  function entitiesByComponent<C extends ECSComponent<string>[]>(
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

function internalAddSystem(
  ecs: () => ECSWorld,
  internals: ECSInternals
): ECSWorld['addSystem'] {
  const entitiesByComponent = internalEntitiesByComponent(ecs, internals);
  function addSystem<T extends ECSComponent<string>[]>(
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
      new Set([...targets].map(e => e.entity_id))
    );
  }
  return addSystem;
}

function internalRemoveSystem(
  ecs: () => ECSWorld,
  internals: ECSInternals
): ECSWorld['removeSystem'] {
  function removeSystem(name: string): void {
    internals.systems = internals.systems.filter(([n]) => n !== name);
    internals.entitiesBySystem.delete(name);
  }
  return removeSystem;
}

function internalRunSystem(
  ecs: () => ECSWorld,
  internals: ECSInternals
): ECSWorld['runSystems'] {
  function runSystems(props: ECSSystemProps) {
    internals.systems.forEach(([name, system]) => {
      const entities = [
        ...(internals.entitiesBySystem.get(name)?.values() ?? [])
      ]
        .map(e => internals.entities.get(e))
        .filter(e => e !== undefined) as ECSEntity[];
      system.run(ecs(), props, entities);
    });
  }
  return runSystems;
}

function internalGet(
  ecs: () => ECSWorld,
  internals: ECSInternals
): ECSWorld['get'] {
  function get<T>(name: string) {
    if (internals.globals.has(name))
      return some(internals.globals.get(name) as T);
    return none<T>();
  }

  return get;
}

function internalSet(
  ecs: () => ECSWorld,
  internals: ECSInternals
): ECSWorld['set'] {
  function set(name: string, global: any) {
    internals.globals.set(name, global);
  }

  return set;
}

function internalDelete(
  ecs: () => ECSWorld,
  internals: ECSInternals
): ECSWorld['delete'] {
  function remove(name: string) {
    internals.globals.delete(name);
  }

  return remove;
}

function internalGlobals(
  ecs: () => ECSWorld,
  internals: ECSInternals
): ECSWorld['globals'] {
  function globals() {
    return internals.globals.entries();
  }

  return globals;
}

/**
 * Creates a new ECSWorld instance.
 * @see ECSWorld
 */
export function createWorld(): ECSWorld {
  const internals = createInternals();

  let ecsHandle: ECSWorld | null = null;
  function ecs() {
    return ecsHandle!;
  }

  ecsHandle = {
    createEntity: internalCreateEntity(ecs, internals),
    deleteEntity: internalDeleteEntity(ecs, internals),
    entities: internalEntities(ecs, internals),
    getEntity: internalGetEntity(ecs, internals),
    addComponent: internalAddComponent(ecs, internals),
    removeComponent: internalRemoveComponents(ecs, internals),
    entitiesByComponent: internalEntitiesByComponent(ecs, internals),
    addSystem: internalAddSystem(ecs, internals),
    removeSystem: internalRemoveSystem(ecs, internals),
    runSystems: internalRunSystem(ecs, internals),
    set: internalSet(ecs, internals),
    get: internalGet(ecs, internals),
    delete: internalDelete(ecs, internals),
    globals: internalGlobals(ecs, internals)
  };

  return ecsHandle;
}
