import type { ECSSystem } from '@/ecs/ECSSystem';
import { PositionBrand, type Position } from '@/entity/Components';
import { VelocityBrand, type Velocity } from '@/entity/Velocity';

export const MovementSystem: ECSSystem<[Position, Velocity]> = {
  target: [PositionBrand, VelocityBrand],
  run: entities => {
    entities.forEach(e => {
      e.position.x += e.velocity.x;
      e.position.y += e.velocity.y;
    });
  }
};
