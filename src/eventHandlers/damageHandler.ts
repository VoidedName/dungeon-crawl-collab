import type { TAudioManager } from '@/createAudioManager';
import { flashRed } from '@/createEffectManager';
import type { ECSEntityId } from '@/ecs/ECSEntity';
import type { ECSWorld } from '@/ecs/ECSWorld';
import { deleteComponent } from '@/entity/components/Delete';
import { hasStats } from '@/entity/components/Stats';
import { clamp } from '@/utils/math';

export const damageHandler = (
  options: {
    damage: number;
    entityId: ECSEntityId;
  },
  ecs: ECSWorld
) => {
  const entityToDamage = ecs.getEntity(options.entityId).unwrap();

  if (hasStats(entityToDamage)) {
    entityToDamage.stats.current;

    entityToDamage.stats.current.health = clamp(
      entityToDamage.stats.current.health - options.damage,
      0,
      entityToDamage.stats.base.health
    );

    ecs.get<TAudioManager>('audio').unwrap().play('damage');

    if (entityToDamage.stats.current.health <= 0) {
      ecs.addComponent(entityToDamage, deleteComponent);
    }
  }

  flashRed(entityToDamage.entity_id);
};
