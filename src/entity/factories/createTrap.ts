import type { ECSWorld } from '../../ecs/ECSWorld';
import { renderableComponent } from '../components/Renderable';
import {
  createAnimatedSprite,
  type SpriteName
} from '../../renderer/createAnimatedSprite';
import { AnimationState, withAnimatable } from '../components/Animatable';
import { registerRenderable } from '../../renderer/renderableManager';
import { withStats } from '../components/Stats';
import { positionComponent } from '@/entity/components/Position';
import { withOrientation } from '../components/Orientation';
import { poisonComponent } from '../components/Poison';
import { velocityComponent } from '../components/Velocity';
import { sizeComponent } from '../components/Size';
import { withMapObject } from '../components/MapObject';
import { enemyComponent } from '../components/Enemy';
import { registerStateMachine } from '@/stateMachines/stateMachineManager';
import { createTrapStateMachine } from '@/stateMachines/trap';

export type CreateTrapOptions = {
  spriteName: SpriteName;
};

export type TrapEntity = ReturnType<typeof createTrap>;

export const createTrap = (world: ECSWorld) => {
  const sprite = createAnimatedSprite('trap', AnimationState.IDLE);

  const trap = world
    .createEntity()
    .with(positionComponent({ x: 190, y: 320 }))
    .with(sizeComponent({ w: 64, h: 64 }))
    .with(withStats({ speed: 5, health: 4 }))
    .with(renderableComponent)
    .with(withOrientation(0))
    .with(withMapObject())
    .with(velocityComponent({ x: 0, y: 0 }))
    .with(withAnimatable('trap'))
    .with(enemyComponent({ type: 'trap' }))
    .build();

  registerRenderable(trap.entity_id, sprite);
  registerStateMachine(trap.entity_id, createTrapStateMachine(trap));

  return trap;
};
