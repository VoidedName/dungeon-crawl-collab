import type { Values } from '@/utils/types';
import type { TrapEntity } from '@/createTrap';
import { createMachine, interpret } from 'xstate';
import { scheduleAnimation } from '@/renderer/AnimationManager';
import { AnimationState } from '@/entity/components/Animatable';
import { getAnimationDuration } from '@/renderer/renderableUtils';

export const TrapState = {
  IDLE: 'idle',
  FIRED: 'fired',
  ACTIVATING: 'activating',
  ACTIVATED: 'activated',
  HAS_HURT: 'has_hurt'
} as const;
export type TrapState = Values<typeof TrapState>;

export const TrapStateTransitions = {
  TRIGGER: 'attack',
  HAS_HURT: 'has_hurt'
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
            [TrapStateTransitions.TRIGGER]: TrapState.FIRED
          },
          entry: () => {
            scheduleAnimation(entity.entity_id, {
              spriteName: entity.animatable.spriteName,
              state: AnimationState.IDLE
            });
          }
        },
        [TrapState.FIRED]: {
          initial: TrapState.ACTIVATING,

          entry: () => {
            scheduleAnimation(entity.entity_id, {
              spriteName: entity.animatable.spriteName,
              state: AnimationState.FIRED,
              loop: false
            });
          },

          after: {
            TRIGGER_DELAY: TrapState.IDLE
          },

          states: {
            [TrapState.ACTIVATING]: {
              after: {
                ACTIVATION_DELAY: TrapState.ACTIVATED
              }
            },

            [TrapState.ACTIVATED]: {},
            [TrapState.HAS_HURT]: {}
          }
        }
      },
      on: {
        [TrapStateTransitions.HAS_HURT]: { target: 'fired.has_hurt' }
      }
    },
    {
      delays: {
        TRIGGER_DELAY: () =>
          getAnimationDuration(
            entity.animatable.spriteName,
            AnimationState.FIRED
          ),
        ACTIVATION_DELAY: () =>
          getAnimationDuration(
            entity.animatable.spriteName,
            AnimationState.ACTIVATING
          )
      }
    }
  );

  return interpret(machine).start();
};
