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

export function createGameLoop(app: Application) {
  const world = createWorld();

  world
    .createEntity()
    .with(withPlayer())
    .with(withPosition(200, 100))
    .with(withVelocity(0, 0))
    .with(withRenderable(1))
    .build();

  world.addSystem('movement', MovementSystem);
  world.addSystem(
    'render',
    RenderSystem(id => (getEntityById(id)! as unknown as TPlayerEntity).sprite)
  );

  function tick() {
    const player = world.entitiesByComponent<[Player, Velocity]>([
      'player',
      'velocity'
    ])[0]!;

    player.velocity = tryPlayerMove();

    world.runSystems();

    // TODO: move into CameraSystem probably?
    const playerSprite = (getEntityById(1)! as unknown as TPlayerEntity).sprite;
    const { x: playerX, y: playerY } = playerSprite.position;
    const cx = playerX - app.screen.width / 2;
    const cy = playerY - app.screen.height / 2;
    app.stage.position.set(-cx, -cy);

    window.requestAnimationFrame(tick);
  }

  window.requestAnimationFrame(tick);
}
