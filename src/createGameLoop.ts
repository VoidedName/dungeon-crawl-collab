import type { Application } from 'pixi.js';
import { getEntityById } from './EntityManager';
import { type TPlayerEntity, tryPlayerMove } from './PlayerEntity';
import { createWorld } from '@/ecs/ECSWorld';
import type { Velocity } from '@/entity/Velocity';
import { MovementSystem } from '@/systems/MovementSystem';
import { RenderSystem } from '@/systems/RenderSystem';
import { withVelocity } from '@/entity/Velocity';
import { CameraSystem } from './systems/CameraSystem';
import { loadMap } from './MapManager';
import { withPlayer, type Player } from './entity/components/Player';
import { withPosition } from './entity/components/Position';
import { withRenderable } from './entity/components/Renderable';
import { InteractionSystem } from './systems/InteractionSystem';

function spriteResolver(id: number) {
  const entity = getEntityById(id);
  if (!entity) throw new Error('invalid sprite of id ' + id);

  return (entity as unknown as TPlayerEntity).sprite;
}

export async function createGameLoop(app: Application) {
  const world = createWorld();

  await loadMap(app, world);

  world
    .createEntity()
    .with(withPlayer())
    .with(withPosition(200, 100))
    .with(withVelocity(0, 0))
    .with(withRenderable(1))
    .build();

  world.addSystem('movement', MovementSystem);
  world.addSystem('render', RenderSystem(spriteResolver));
  world.addSystem('camera', CameraSystem(spriteResolver, app));
  world.addSystem('interactions', InteractionSystem(spriteResolver, world));

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
