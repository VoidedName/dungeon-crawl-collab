import type { TAudioManager } from '@/createAudioManager';
import { flashRed } from '@/createEffectManager';
import type { ECSEntityId } from '@/ecs/ECSEntity';
import type { ECSWorld } from '@/ecs/ECSWorld';
import { deleteComponent } from '@/entity/components/Delete';
import { hasEnemy } from '@/entity/components/Enemy';
import { hasPlayer } from '@/entity/components/Player';
import { dealDamage } from '@/utils/ecsUtils';
import type { ECSEmitter } from '../createExternalQueue';

export const damageHandler = (
  options: {
    damage: number;
    entityId: ECSEntityId;
  },
  world: ECSWorld,
  navigateTo: (path: string) => void,
  emit: ECSEmitter
) => {
  const entityToDamage = world.getEntity(options.entityId).unwrap();

  let stats: any;

  dealDamage({
    to: entityToDamage as any,
    amount: options.damage,
    world: world
  });

  if (hasPlayer(entityToDamage)) {
    ({ stats } = entityToDamage.player);
    world.get<TAudioManager>('audio').unwrap().play('ouch');
    emit('playerHealthChanged');
    if (stats.current.health <= 0) {
      alert('you dead');
      navigateTo('/');
    }
  } else if (hasEnemy(entityToDamage)) {
    ({ stats } = entityToDamage.enemy);
    world.get<TAudioManager>('audio').unwrap().play('damage');
  }

  if (stats.current.health <= 0) {
    world.addComponent(entityToDamage, deleteComponent);
  }

  flashRed(entityToDamage.entity_id);
};
