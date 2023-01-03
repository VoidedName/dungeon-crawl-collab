import type { ECSWorld } from './ecs/ECSWorld';
import { withMovementIntent } from './entity/components/MovementIntent';
import { playerComponent } from './entity/components/Player';
import { withVelocity } from './entity/components/Velocity';
import {
  createAnimatedSprite,
  type SpriteName
} from './renderer/createAnimatedSprite';
import { AnimationState, withAnimatable } from './entity/components/Animatable';
import { register } from './renderer/renderableCache';
import { withStats } from './entity/components/Stats';
import { withOrientation } from './entity/components/Orientation';
import { withInteractIntent } from './entity/components/InteractIntent';
import { positionComponent } from '@/entity/components/Position';
import { withSize } from './entity/components/Size';
import { scheduleAnimation } from './renderer/AnimationManager';
import { renderableComponent } from './entity/components/Renderable';

export type CreatePlayerOptions = {
  spriteName: SpriteName;
};
export const createPlayer = (world: ECSWorld, options: CreatePlayerOptions) => {
  const sprite = createAnimatedSprite(options.spriteName, AnimationState.IDLE);
  sprite.zIndex = 1;

  const player = world
    .createEntity()
    .with(playerComponent)
    .with(positionComponent({ x: 200, y: 100 }))
    .with(withSize(64, 64))
    .with(withStats({ speed: 5, health: 10 }))
    .with(withVelocity({ x: 0, y: 0 }))
    .with(withOrientation(0))
    .with(renderableComponent)
    .with(withAnimatable(options.spriteName))
    .with(withMovementIntent())
    .with(withInteractIntent())
    .build();

  register(player.entity_id, sprite);
  scheduleAnimation(player.entity_id, {
    state: AnimationState.IDLE,
    spriteName: options.spriteName
  });

  return player;
};
