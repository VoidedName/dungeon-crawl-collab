import type { ECSWorld } from '@/ecs/ECSWorld';
import type { Point } from '@/utils/types';
import { CameraBrand, type Camera } from '@/entity/components/Camera';

export const setCameraOffsetHandler = (offset: Point, world: ECSWorld) => {
  const [camera] = world.entitiesByComponent<[Camera]>([CameraBrand]);

  if (!camera) return;
  camera.camera.offset = offset;
};
