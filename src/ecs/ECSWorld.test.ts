import { beforeEach, describe, expect, test } from 'vitest';
import type { ECSWorld } from '@/ecs/ECSWorld';
import { createWorld } from '@/ecs/ECSWorld';
import type { ECSSystem } from '@/ecs/ECSSystem';
import type { ECSComponent } from '@/ecs/ECSComponent';
import type { ECSEntity } from '@/ecs/ECSEntity';

type TestComponentOne = ECSComponent<'one', { value: number }>;

function withTestComponentOne(value: number): () => TestComponentOne {
  return () => ({
    one: {
      value
    }
  });
}

type TestComponentTwo = ECSComponent<'two', { key: string }>;

function withTestComponentTwo(key: string): () => TestComponentTwo {
  return () => ({
    two: {
      key
    }
  });
}

let world: ECSWorld;

describe('adding and removing entities', () => {
  beforeEach(() => {
    world = createWorld();
  });

  test('empty world has no entities', () => {
    expect([...world.entities()].length).toBe(0);
  });

  test('world has entities after creating some', () => {
    world.createEntity().build();
    expect([...world.entities()].length).toBe(1);
    world.createEntity().build();
    expect([...world.entities()].length).toBe(2);
  });

  test('deleting entities from world shrinks entities', () => {
    world.createEntity().build();
    world.createEntity().build();
    world.deleteEntity([...world.entities()][0]!);
    expect([...world.entities()].length).toBe(1);
  });
});

describe('adding and removing components', () => {
  beforeEach(() => {
    world = createWorld();
  });

  test('entity build with component has the component', () => {
    world.createEntity().with(withTestComponentOne(42)).build();

    const entity = world.entitiesByComponent<[TestComponentOne]>(['one'])[0]!;

    expect(entity.one).toBeDefined();
    expect(entity.one.value).toBe(42);
  });

  test('entity build with multiple component has those component', () => {
    world
      .createEntity()
      .with(withTestComponentOne(13))
      .with(withTestComponentTwo('some value'))
      .build();

    const entity = world.entitiesByComponent<
      [TestComponentOne, TestComponentTwo]
    >(['one', 'two'])[0]!;

    expect(entity.one).toBeDefined();
    expect(entity.one.value).toBe(13);

    expect(entity.two).toBeDefined();
    expect(entity.two.key).toBe('some value');
  });

  test('adding component to entity after build actually adds it', () => {
    const entity = world.createEntity().with(withTestComponentOne(13)).build();

    world.addComponent(entity, withTestComponentTwo('second'));

    const after = world.entitiesByComponent<
      [TestComponentOne, TestComponentTwo]
    >(['one', 'two'])[0]!;

    expect(after.one).toBeDefined();
    expect(after.one.value).toBe(13);

    expect(after.two).toBeDefined();
    expect(after.two.key).toBe('second');
  });

  test('removing a component actually removes it', () => {
    world
      .createEntity()
      .with(withTestComponentOne(13))
      .with(withTestComponentTwo('some value'))
      .build();

    const entity = world.entitiesByComponent<
      [TestComponentOne, TestComponentTwo]
    >(['one', 'two'])[0]!;

    world.removeComponent<typeof entity, TestComponentOne>(entity, 'one');

    const after = world.entitiesByComponent<[TestComponentTwo]>(['two'])[0]!;

    expect(entity.one).not.toBeDefined();
    expect('one' in after).toBeFalsy();

    expect(entity.two).toBeDefined();
    expect(entity.two.key).toBe('some value');
  });
});

describe('adding and removing systems', () => {
  const TestSystemOne: (
    data: ECSEntity[]
  ) => ECSSystem<[TestComponentOne]> = data => ({
    target: ['one'],
    run: entities => {
      entities.forEach(e => data.push(e));
    }
  });

  const TestSystemTwo: (
    data: ECSEntity[]
  ) => ECSSystem<[TestComponentTwo]> = data => ({
    target: ['two'],
    run: entities => {
      entities.forEach(e => data.push(e));
    }
  });

  const TestSystemOneAndTwo: (
    data: ECSEntity[]
  ) => ECSSystem<[TestComponentOne, TestComponentTwo]> = data => ({
    target: ['one', 'two'],
    run: entities => {
      entities.forEach(e => data.push(e));
    }
  });

  let entityOne: ECSEntity;
  let entityTwo: ECSEntity;
  let entityOneAndTwo: ECSEntity;

  beforeEach(() => {
    world = createWorld();
    entityOne = world.createEntity().with(withTestComponentOne(1)).build();
    entityTwo = world
      .createEntity()
      .with(withTestComponentTwo('other'))
      .build();
    entityOneAndTwo = world
      .createEntity()
      .with(withTestComponentOne(3))
      .with(withTestComponentTwo('third'))
      .build();
  });

  test('run systems doesnt crash', () => {
    world.runSystems();
  });

  test('runSystem runs systems with correct entities', () => {
    [
      ['one', TestSystemOne, [entityOne, entityOneAndTwo]],
      ['two', TestSystemTwo, [entityTwo, entityOneAndTwo]],
      ['oneAndTwo', TestSystemOneAndTwo, [entityOneAndTwo]]
    ].forEach(value => {
      const [name, system, result] = value as [
        string,
        (data: ECSEntity[]) => ECSSystem<any>,
        ECSEntity[]
      ];

      const data: ECSEntity[] = [];
      world.addSystem(name, system(data));
      world.runSystems();

      expect(data.length).toBe(result.length);
      expect(data.map(e => e.entity_id).sort()).toStrictEqual(
        result.map(e => e.entity_id).sort()
      );
    });
  });

  test('runSystem does not run removed systems', () => {
    const data: ECSEntity[] = [];
    world.addSystem('two', TestSystemTwo(data));
    world.removeSystem('two');
    world.runSystems();

    expect(data.length).toBe(0);
  });
});
