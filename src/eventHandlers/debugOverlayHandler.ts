import type { ECSWorld } from '@/ecs/ECSWorld';
import { DebugFlags } from '@/systems/DebugRenderer';

export const debugOverlayHandler = (world: ECSWorld) => {
  const isDebugOn = world.get<boolean>(DebugFlags.map).getOrElse(() => false);
  world.set(DebugFlags.map, !isDebugOn);
};
