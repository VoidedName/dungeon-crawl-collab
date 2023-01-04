import type { ECSEntity } from '@/ecs/ECSEntity';
import type { ECSWorld } from '@/ecs/ECSWorld';
import { PlayerBrand, type Player } from '@/entity/components/Player';

export function getPlayer(ecs: ECSWorld): ECSEntity & Player {
  return ecs.entitiesByComponent<[Player]>([PlayerBrand])[0]!;
}
