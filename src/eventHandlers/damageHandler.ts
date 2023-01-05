import type { TAudioManager } from '@/createAudioManager';
import { flashRed } from '@/createEffectManager';
import type { ECSEntityId } from '@/ecs/ECSEntity';
import type { ECSWorld } from '@/ecs/ECSWorld';
import { deleteComponent } from '@/entity/components/Delete';
import { hasPlayer } from '@/entity/components/Player';
import { clamp } from '@/utils/math';

export const damageHandler = (
  options: {
    damage: number;
    entityId: ECSEntityId;
  },
  ecs: ECSWorld
) => {
  const entityToDamage = ecs.getEntity(options.entityId).unwrap();

  if (hasPlayer(entityToDamage)) {
    const { stats } = entityToDamage.player;
    stats.current.health = clamp(
      stats.current.health - options.damage,
      0,
      stats.base.health
    );

    ecs.get<TAudioManager>('audio').unwrap().play('damage');

    if (stats.current.health <= 0) {
      ecs.addComponent(entityToDamage, deleteComponent);
    }
  }

  flashRed(entityToDamage.entity_id);
};
