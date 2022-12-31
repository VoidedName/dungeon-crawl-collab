import { tryPlayerMove } from '@/PlayerEntity';
import type { ECSSystem } from '@/ecs/ECSSystem';
import { VelocityBrand, type Velocity } from '@/entity/Velocity';

export const VelocitySystem: ECSSystem<[Velocity]> = {
  target: [VelocityBrand],
  run: entities => {
    entities.forEach(e => {
      e.velocity = tryPlayerMove();
    });
  }
};
