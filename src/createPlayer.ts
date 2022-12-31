import type { ECSWorld } from './ecs/ECSWorld';
import { withMovementIntent } from './entity/components/MovementIntent';
import { withPlayer } from './entity/components/Player';
import { withPosition } from './entity/components/Position';
import { withRenderable } from './entity/components/Renderable';
import { withVelocity } from './entity/components/Velocity';
import {
  createAnimatedSprite,
  type SpriteName
} from './renderer/createAnimatedSprite';
import { AnimationState, withAnimatable } from './entity/components/Animatable';
import { register } from './renderer/renderableCache';

export type CreatePlayerOptions = {
  spriteName: SpriteName;
};
export const createPlayer = async (
  world: ECSWorld,
  options: CreatePlayerOptions
) => {
  const id = 'PLAYER';
  const sprite = await createAnimatedSprite(
    options.spriteName,
    AnimationState.IDLE
  );
  await register(id, sprite);

  world
    .createEntity()
    .with(withPlayer())
    .with(withPosition(200, 100))
    .with(withVelocity(5))
    .with(withRenderable(id))
    .with(withAnimatable(options.spriteName))
    .with(withMovementIntent())
    .build();
};
