import type { ECSEntity } from '@/ecs/ECSEntity';
import type { ECSWorld } from '@/ecs/ECSWorld';
import { PlayerBrand, type Player } from '@/entity/components/Player';

export function getPlayer(world: ECSWorld): ECSEntity & Player {
  return world.entitiesByComponent<[Player]>([PlayerBrand])[0]!;
}
