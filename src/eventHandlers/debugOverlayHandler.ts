import type { ECSWorld } from '@/ecs/ECSWorld';
import { DebugFlags } from '@/systems/DebugRenderer';

export const debugOverlayHandler = (
  payload: keyof DebugFlags,
  world: ECSWorld
) => {
  const isDebugOn = world
    .get<boolean>(DebugFlags[payload])
    .getOrElse(() => false);
  world.set(DebugFlags[payload], !isDebugOn);
};
