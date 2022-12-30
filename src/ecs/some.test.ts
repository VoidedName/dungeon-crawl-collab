import { describe, expect, test } from 'vitest';
import { createWorld } from '@/ecs/ECSWorld';
import type { Player, Position } from '@/entity/Components';
import type { ECSSystem } from '@/ecs/ECSSystem';
import { withPlayer, withPosition } from '@/entity/Components';

describe('testing if it works', () => {
  test('when world', () => {
    const world = createWorld();

    const player = world
      .createEntity()
      .with(withPlayer())
      .with(withPosition(3, 5))
      .build();

    world.createEntity().with(withPosition(3, 5)).build();

    expect(world.entitiesByComponent(['player'])).toStrictEqual([player]);

    expect(world.entitiesByComponent(['position', 'player'])).toStrictEqual([
      player
    ]);

    world.addSystem('player_position', <ECSSystem<[Player, Position]>>{
      target: ['player', 'position'],
      run: entities => {
        entities.forEach(e => console.log(e));
      }
    });

    world.runSystems();

    world.addSystem('position', <ECSSystem<[Position]>>{
      target: ['position'],
      run: entities => {
        entities.forEach(e => console.log(e));
      }
    });

    world.runSystems();

    world.createEntity().with(withPosition(6, 5)).build();

    world.runSystems();
  });
});
