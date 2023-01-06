import type { ECSWorld } from '../../ecs/ECSWorld';
import { renderableComponent } from '../components/Renderable';
import { createAnimatedSprite } from '../../renderer/createAnimatedSprite';
import { AnimationState, withAnimatable } from '../components/Animatable';
import { registerRenderable } from '../../renderer/renderableManager';
import { positionComponent } from '@/entity/components/Position';
import { withOrientation } from '../components/Orientation';
import { velocityComponent } from '../components/Velocity';
import { sizeComponent } from '../components/Size';
import { withMapObject } from '../components/MapObject';
import { enemyComponent } from '../components/Enemy';
import { registerStateMachine } from '@/stateMachines/stateMachineManager';
import { createTrapStateMachine } from '@/stateMachines/trap';
import type { CodexEnemy } from '@/assets/types';
import { collidableComponent } from '../components/Collidable';

export type CreateTrapOptions = {
  enemy: CodexEnemy;
};

export type TrapEntity = ReturnType<typeof createTrap>;

export const createTrap = (world: ECSWorld, options: CreateTrapOptions) => {
  const sprite = createAnimatedSprite(
    options.enemy.spriteName,
    AnimationState.IDLE
  );

  const trap = world
    .createEntity()
    .with(positionComponent({ x: 190, y: 320 }))
    .with(sizeComponent({ w: 64, h: 64 }))
    .with(renderableComponent)
    .with(withOrientation(0))
    .with(withMapObject())
    .with(velocityComponent({ x: 0, y: 0 }))
    .with(withAnimatable('trap'))
    .with(
      enemyComponent({
        type: 'trap',
        stats: {
          base: options.enemy.baseStats,
          current: options.enemy.baseStats
        }
      })
    )
    .build();

  registerRenderable(trap.entity_id, sprite);
  registerStateMachine(trap.entity_id, createTrapStateMachine(trap));

  return trap;
};
