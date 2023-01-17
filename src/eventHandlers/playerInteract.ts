import type { ECSWorld } from '@/ecs/ECSWorld';
import {
  InteractIntentBrand,
  type InteractIntent
} from '@/entity/components/InteractIntent';
import { PlayerBrand, type Player } from '@/entity/components/Player';

export const playerInteractHandler = (
  isInteracting: boolean,
  world: ECSWorld
) => {
  const [player] = world.entitiesByComponent<[Player, InteractIntent]>([
    PlayerBrand,
    InteractIntentBrand
  ]);
  if (!player) return;
  player.interact_intent.isInteracting = isInteracting;
  // check if play can interact
  // TODO: loop through interactable entities near the player
  // interact with the closest
};
