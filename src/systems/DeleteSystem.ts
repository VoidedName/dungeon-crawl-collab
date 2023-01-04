import type { ECSSystem } from '@/ecs/ECSSystem';
import { hasRenderable } from '@/entity/components/Renderable';
import { DeleteBrand, type Delete } from '@/entity/components/Delete';
import { hasStateAware } from '@/entity/components/StateAware';
import { cleanupRenderable } from '@/renderer/renderableManager';
import { cleanupStateMachine } from '@/stateMachines/stateMachineManager';

export const DeleteSystem: () => ECSSystem<[Delete]> = () => ({
  target: [DeleteBrand],
  run: (ecs, props, entities) => {
    entities.forEach(entity => {
      ecs.deleteEntity(entity);
      if (hasRenderable(entity)) {
        cleanupRenderable(entity.entity_id);
      }

      if (hasStateAware(entity)) {
        cleanupStateMachine(entity.entity_id);
      }
    });
  }
});
