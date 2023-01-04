import type { Values } from '@/utils/types';
import type { TrapEntity } from '@/createTrap';
import { createMachine, interpret } from 'xstate';
import { scheduleAnimation } from '@/renderer/AnimationManager';
import { AnimationState } from '@/entity/components/Animatable';
import { getAnimationDuration } from '@/renderer/renderableUtils';

export const TrapState = {
  IDLE: 'idle',
  FIRED: 'fired'
} as const;
export type TrapState = Values<typeof TrapState>;

export const TrapStateTransitions = {
  RELOAD: 'reload',
  ATTACK: 'attack'
} as const;
export type TrapStateTransitions = Values<typeof TrapStateTransitions>;

export type TrapstateMachine = ReturnType<typeof createTrapStateMachine>;

export const createTrapStateMachine = (entity: TrapEntity) => {
  const machine = createMachine(
    {
      id: `trap-${entity.entity_id}`,
      initial: 'idle',
      predictableActionArguments: true,
      states: {
        [TrapState.IDLE]: {
          on: {
            [TrapStateTransitions.ATTACK]: TrapState.FIRED
          },
          entry: () => {
            scheduleAnimation(entity.entity_id, {
              spriteName: entity.animatable.spriteName,
              state: AnimationState.IDLE
            });
          }
        },
        [TrapState.FIRED]: {
          on: {
            [TrapStateTransitions.RELOAD]: TrapState.IDLE
          },
          entry: () => {
            scheduleAnimation(entity.entity_id, {
              spriteName: entity.animatable.spriteName,
              state: AnimationState.FIRED
            });
          },
          after: {
            ATTACK_DELAY: {
              target: TrapState.IDLE
            }
          }
        }
      }
    },
    {
      delays: {
        ATTACK_DELAY: () =>
          getAnimationDuration(
            entity.animatable.spriteName,
            AnimationState.FIRED
          )
      }
    }
  );

  return interpret(machine).start();
};
