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

  entitiesByComponent<C extends ECSComponent<any>[]>(
    keys: BrandsFromComponents<C>
  ): (ECSEntity & Intersect<C>)[];

  addSystem<T extends ECSComponent<any>[]>(
    name: string,
    system: ECSSystem<T>
  ): void;

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

// we would add systems to the world as well, and optimise them (then need static access)
export function createWorld(): ECSWorld {
  const internals = createInternals();

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

  function createEntity(): ECSEntityBuilder<ECSEntity> {
    return entityBuilder(internals);
  }

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

  return {
    createEntity,
    entitiesByComponent,
    addSystem,
    runSystems
  };
}
