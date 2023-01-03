import type { ECSWorld } from './ecs/ECSWorld';
import { renderableComponent } from './entity/components/Renderable';
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
import { poisonComponent } from './entity/components/Poison';

export type CreateTrapOptions = {
  spriteName: SpriteName;
};

export const createTrap = (world: ECSWorld, options: CreateTrapOptions) => {
  const sprite = createAnimatedSprite(options.spriteName, AnimationState.IDLE);

  const trap = world
    .createEntity()
    .with(positionComponent({ x: 190, y: 320 }))
    .with(withStats({ speed: 5, health: 4 }))
    .with(renderableComponent)
    .with(withOrientation(0))
    .with(withVelocity({ x: 0, y: 0 }))
    .with(withAnimatable(options.spriteName))
    .with(
      poisonComponent({
        damage: 1,
        duration: Number.POSITIVE_INFINITY,
        nextDamageIn: 1000
      })
    )
    .build();

  register(trap.entity_id, sprite);
};
