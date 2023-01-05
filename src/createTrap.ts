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
import { createTrapStateMachine } from './stateMachines/trap';
import { registerStateMachine } from './stateMachines/stateMachineManager';
import { enemyComponent } from './entity/components/Enemy';
import { withSize } from './entity/components/Size';
import { poisonComponent } from './entity/components/Poison';

export type CreateTrapOptions = {
  spriteName: SpriteName;
};

export type TrapEntity = ReturnType<typeof createTrap>;

export const createTrap = (world: ECSWorld) => {
  const sprite = createAnimatedSprite('trap', AnimationState.IDLE);

  const trap = world
    .createEntity()
    .with(positionComponent({ x: 190, y: 320 }))
    .with(withSize(64, 64))
    .with(withStats({ speed: 5, health: 4 }))
    .with(renderableComponent)
    .with(withOrientation(0))
    .with(withMapObject())
    .with(withVelocity({ x: 0, y: 0 }))
    .with(withAnimatable('trap'))
    .with(enemyComponent({ type: 'trap' }))
    .build();
  registerRenderable(trap.entity_id, sprite);
  registerStateMachine(trap.entity_id, createTrapStateMachine(trap));

  return trap;
};
