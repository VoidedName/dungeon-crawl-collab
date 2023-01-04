import type { ECSEntityId } from '@/ecs/ECSEntity';
import type { PlayerstateMachine } from './player';

type StateMachine = PlayerstateMachine;

const stateMachineLookup = new Map<ECSEntityId, StateMachine>();

export const resolveStateMachine = <T extends StateMachine>(
  id: ECSEntityId
): T => {
  const machine = stateMachineLookup.get(id);
  if (!machine) {
    throw new Error(`Entity State Machine not found for id ${id}`);
  }

  return machine as T;
};

export const registerStateMachine = (
  id: ECSEntityId,
  stateMachine: StateMachine
) => {
  stateMachineLookup.set(id, stateMachine);
};

export const cleanupStateMachine = (id: ECSEntityId) => {
  const machine = resolveStateMachine(id);
  machine.stop();

  stateMachineLookup.delete(id);
};
