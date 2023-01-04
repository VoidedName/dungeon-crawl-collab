import type { ECSWorld } from '../../ecs/ECSWorld';
import { withMovementIntent } from '../components/MovementIntent';
import { playerComponent } from '../components/Player';
import { withVelocity } from '../components/Velocity';
import {
  createAnimatedSprite,
  type SpriteName
} from '../../renderer/createAnimatedSprite';
import { AnimationState, withAnimatable } from '../components/Animatable';
import { registerRenderable } from '../../renderer/renderableManager';
import { withStats } from '../components/Stats';
import { withOrientation } from '../components/Orientation';
import { positionComponent } from '@/entity/components/Position';
import { withSize } from '../components/Size';
import { renderableComponent } from '../components/Renderable';
import type { Point } from '@/utils/types';
import { toAngle } from '@/utils/vectors';
import { projectileComponent } from '../components/Projectile';

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

  const projectile = world
    .createEntity()
    .with(projectileComponent)
    .with(positionComponent(options.position))
    .with(withSize(64, 64))
    .with(withStats({ speed: 10, health: 1 }))
    .with(withVelocity(options.target))
    .with(withOrientation(toAngle(options.target)))
    .with(renderableComponent)
    .with(withAnimatable(options.spriteName))
    .build();

  registerRenderable(projectile.entity_id, sprite);
  console.log(options.target, projectile.orientation.angle);
  return projectile;
};
