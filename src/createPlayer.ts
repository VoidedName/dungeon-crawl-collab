import type { ECSWorld } from './ecs/ECSWorld';
import { withMovementIntent } from './entity/MovementIntent';
import { withPlayer } from './entity/Player';
import { withPosition } from './entity/Position';
import { withRenderable } from './entity/Renderable';
import { withVelocity } from './entity/Velocity';

export const createPlayer = (world: ECSWorld) =>
  world
    .createEntity()
    .with(withPlayer())
    .with(withPosition(200, 100))
    .with(withVelocity(5))
    .with(withRenderable(1))
    .with(withMovementIntent())
    .build();
