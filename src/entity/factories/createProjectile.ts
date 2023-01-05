import type { ECSWorld } from '../../ecs/ECSWorld';
import {
  createAnimatedSprite,
  type SpriteName
} from '../../renderer/createAnimatedSprite';
import { AnimationState, withAnimatable } from '../components/Animatable';
import { registerRenderable } from '../../renderer/renderableManager';
import { withStats } from '../components/Stats';
import { withOrientation } from '../components/Orientation';
import { positionComponent } from '@/entity/components/Position';
import { renderableComponent } from '../components/Renderable';
import type { Point } from '@/utils/types';
import { normalizeVector, setMagnitude, toAngle } from '@/utils/vectors';
import { projectileComponent } from '../components/Projectile';
import { sizeComponent } from '../components/Size';
import { registerStateMachine } from '@/stateMachines/stateMachineManager';
import { createProjectileStateMachine } from '@/stateMachines/projectile';
import { stateAwareComponent } from '../components/StateAware';
import { velocityComponent } from '../components/Velocity';

export type CreateProjectileOptions = {
  spriteName: SpriteName;
  position: Point;
  target: Point;
};

export type ProjectileEntity = ReturnType<typeof createProjectile>;
export const createProjectile = (
  world: ECSWorld,
  options: CreateProjectileOptions
) => {
  const sprite = createAnimatedSprite(options.spriteName, AnimationState.IDLE);
  sprite.zIndex = 1;

  const speed = 8;

  const projectile = world
    .createEntity()
    .with(projectileComponent)
    .with(positionComponent(options.position))
    .with(sizeComponent({ w: 64, h: 64 }))
    .with(withStats({ speed, health: 1 }))
    .with(velocityComponent(setMagnitude(options.target, speed)))
    .with(withOrientation(toAngle(options.target)))
    .with(renderableComponent)
    .with(stateAwareComponent)
    .with(withAnimatable(options.spriteName))
    .build();

  registerRenderable(projectile.entity_id, sprite);
  registerStateMachine(
    projectile.entity_id,
    createProjectileStateMachine(projectile, world)
  );
  return projectile;
};
