import type { ECSSystem } from '@/ecs/ECSSystem';
import type { Position } from '@/entity/Components';
import type { Velocity } from '@/entity/Velocity';

export const MovementSystem: ECSSystem<[Position, Velocity]> = {
  target: ['position', 'velocity'],
  run: entities => {
    entities.forEach(e => {
      e.position.x += e.velocity.x;
      e.position.y += e.velocity.y;
    });
  }
};
