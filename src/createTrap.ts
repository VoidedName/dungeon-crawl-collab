import type { ECSWorld } from './ecs/ECSWorld';
import { renderableComponent } from './entity/components/Renderable';
import {
  createAnimatedSprite,
  type SpriteName
} from './renderer/createAnimatedSprite';
import { AnimationState, withAnimatable } from './entity/components/Animatable';
import { registerRenderable } from './renderer/renderableManager';
import { withStats } from './entity/components/Stats';
import { positionComponent } from '@/entity/components/Position';
import { withVelocity } from './entity/components/Velocity';
import { withOrientation } from './entity/components/Orientation';
import { withMapObject } from './entity/components/MapObject';

export type CreateTrapOptions = {
  spriteName: SpriteName;
};

export const createTrap = (world: ECSWorld) => {
  const sprite = createAnimatedSprite('trap', AnimationState.IDLE);

  const trap = world
    .createEntity()
    .with(positionComponent({ x: 190, y: 320 }))
    .with(withStats({ speed: 5, health: 4 }))
    .with(renderableComponent)
    .with(withOrientation(0))
    .with(withMapObject())
    .with(withVelocity({ x: 0, y: 0 }))
    .with(withAnimatable('trap'))
    .build();

  registerRenderable(trap.entity_id, sprite);
  return trap;
};
