import type { ECSWorld } from './ecs/ECSWorld';
import { positionComponent } from '@/entity/components/Position';
import { cameraComponent } from './entity/components/Camera';
import type { ECSEntityId } from './ecs/ECSEntity';

export const createCamera = async (
  world: ECSWorld,
  following?: ECSEntityId
) => {
  return world
    .createEntity()
    .with(cameraComponent({ following, offset: { x: 0, y: 0 } }))
    .with(positionComponent({ x: 0, y: 0 }))
    .build();
};
