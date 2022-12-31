import type { ECSWorld } from './ecs/ECSWorld';
import { withMovementIntent } from './entity/MovementIntent';
import { withPlayer } from './entity/Player';
import { withPosition } from './entity/Position';
import { withRenderable } from './entity/Renderable';
import { withVelocity } from './entity/Velocity';
import type { sprites } from '@/assets/sprites';
import type { SpriteIdentifier } from './renderer/createSprite';
import { withAnimatable } from './entity/Animatable';

export type CreatePlayerOptions = {
  spriteName: SpriteIdentifier;
};
export const createPlayer = (world: ECSWorld, options: CreatePlayerOptions) =>
  world
    .createEntity()
    .with(withPlayer())
    .with(withPosition(200, 100))
    .with(withVelocity(5))
    .with(withRenderable(1, options.spriteName))
    .with(withAnimatable())
    .with(withMovementIntent())
    .build();
