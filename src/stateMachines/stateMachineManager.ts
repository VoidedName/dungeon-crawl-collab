import type { ECSEntityId } from '@/ecs/ECSEntity';
import type { PlayerstateMachine } from './player';

type StateMachine = PlayerstateMachine;

const stateMachineLookup = new Map<ECSEntityId, StateMachine>();

export const resolveStateMachine = <T extends StateMachine>(
  id: ECSEntityId
): T => {
  const sprite = stateMachineLookup.get(id);
  if (!sprite) {
    throw new Error(`Entity State Machine not found for id ${id}`);
  }

  return sprite as T;
};

export const registerStateMachine = (
  id: ECSEntityId,
  stateMachine: StateMachine
) => {
  stateMachineLookup.set(id, stateMachine);
};
