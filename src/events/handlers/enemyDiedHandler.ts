import type { ECSEmitter } from '@/createGameLoop';
import type { ECSEntity } from '@/ecs/ECSEntity';
import type { ECSWorld } from '@/ecs/ECSWorld';
import type { Enemy } from '@/entity/components/Enemy';

export const enemyDiedHandler = (
  enemy: ECSEntity & Enemy,
  world: ECSWorld,
  emit: ECSEmitter
) => {
  console.log(enemy, world, emit);
};
