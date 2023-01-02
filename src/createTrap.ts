import type { ECSWorld } from './ecs/ECSWorld';
import { withRenderable } from './entity/components/Renderable';
import {
  createAnimatedSprite,
  type SpriteName
} from './renderer/createAnimatedSprite';
import { AnimationState, withAnimatable } from './entity/components/Animatable';
import { register } from './renderer/renderableCache';
import { withStats } from './entity/components/Stats';
import { positionComponent } from '@/entity/components/Position';
import { withVelocity } from './entity/components/Velocity';
import { withOrientation } from './entity/components/Orientation';

export type CreateTrapOptions = {
  spriteName: SpriteName;
};

export const createTrap = async (
  world: ECSWorld,
  options: CreateTrapOptions
) => {
  const id = 'TRAP';
  const sprite = await createAnimatedSprite(
    options.spriteName,
    AnimationState.IDLE
  );
  await register(id, sprite);

  world
    .createEntity()
    .with(positionComponent({ x: 190, y: 320 }))
    .with(withStats({ speed: 5, health: 4 }))
    .with(withRenderable(id))
    .with(withOrientation(0))
    .with(withVelocity({ x: 0, y: 0 }))
    .with(withAnimatable(options.spriteName))
    .build();
};
