import type { Application } from 'pixi.js';
import { getEntityById } from './EntityManager';
import { type TPlayerEntity, tryPlayerMove } from './PlayerEntity';
import { createWorld } from '@/ecs/ECSWorld';
import type { Player, Position } from '@/entity/Components';
import type { Velocity } from '@/entity/Velocity';
import { MovementSystem } from '@/systems/MovementSystem';
import { RenderSystem } from '@/systems/RenderSystem';
import { withPlayer, withPosition, withRenderable } from '@/entity/Components';
import { withVelocity } from '@/entity/Velocity';
import { CameraSystem } from './systems/CameraSystem';

function spriteResolver(id: number) {
  return (getEntityById(id)! as unknown as TPlayerEntity).sprite;
}

export function createGameLoop() {
  const world = createWorld();

  world
    .createEntity()
    .with(withPlayer())
    .with(withPosition(200, 100))
    .with(withVelocity(0, 0))
    .with(withRenderable(1))
    .build();

  world.addSystem('movement', MovementSystem);
  world.addSystem('render', RenderSystem(spriteResolver));
  world.addSystem('camera', CameraSystem(spriteResolver));

  function tick() {
    const player = world.entitiesByComponent<[Player, Velocity]>([
      'player',
      'velocity'
    ])[0]!;

    player.velocity = tryPlayerMove();

    world.runSystems();

    window.requestAnimationFrame(tick);
  }

  window.requestAnimationFrame(tick);
}
