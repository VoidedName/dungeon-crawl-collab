import type { ECSWorld } from '@/ecs/ECSWorld';
import type { ECSEmitter } from '../createExternalQueue';
import type { ECSEntity, ECSEntityId } from '@/ecs/ECSEntity';
import { deleteComponent } from '@/entity/components/Delete';
import { hasPlayer, type Player } from '@/entity/components/Player';
import { hasEnemy, type Enemy } from '@/entity/components/Enemy';
import { getPlayer } from '@/utils/getPlayer';
import { MAX_LEVEL, experienceTable } from '@/assets/codex/resources/expTable';

const getExperienceGain = (
  player: ECSEntity & Player,
  Enemy: ECSEntity & Enemy
) => {
  // let's figure out the heuristics to compute experience gain later
  return 10;
};

const addExperience = (world: ECSWorld, entity: ECSEntity & Enemy) => {
  const player = getPlayer(world);
  const { stats } = player.player;
  if (stats.current.level > MAX_LEVEL) return;

  const experienceGain = getExperienceGain(player, entity);
  stats.current.experience += experienceGain;

  const isLevelUp =
    stats.current.experience >= stats.current.experienceToNextLevel;

  if (!isLevelUp) return;

  stats.current.level++;
  stats.current.experience =
    stats.current.experience % stats.current.experienceToNextLevel;
  if (stats.current.level > MAX_LEVEL) return;

  const nextLevel = (stats.current.level + 1) as keyof typeof experienceTable;
  stats.current.experienceToNextLevel = experienceTable[nextLevel];
};

export const entityDiedHandler = (
  entityId: ECSEntityId,
  world: ECSWorld,
  emit: ECSEmitter,
  navigateTo: (path: string) => void
) => {
  const entity = world.getEntity(entityId).unwrap();
  world.addComponent(entity, deleteComponent);

  if (hasPlayer(entity)) {
    alert('you dead');
    return navigateTo('/');
  }

  if (hasEnemy(entity)) {
    addExperience(world, entity);

    emit('playerUpdate');
    //TODO add DEAD state to enemy state machine, do animation, FX, etc
  }
};
