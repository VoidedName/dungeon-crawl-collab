import type { ECSWorld } from './ecs/ECSWorld';
import { withPlayer } from './entity/Player';
import { withPosition } from './entity/Position';
import { withRenderable } from './entity/Renderable';
import { withVelocity } from './entity/Velocity';

export const createPlayer = (world: ECSWorld) =>
  world
    .createEntity()
    .with(withPlayer())
    .with(withPosition(200, 100))
    .with(withVelocity(0, 0))
    .with(withRenderable(1))
    .build();
