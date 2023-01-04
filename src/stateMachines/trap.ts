import type { Values } from '@/utils/types';
import type { TrapEntity } from '@/createTrap';
import { createMachine, interpret } from 'xstate';
import { scheduleAnimation } from '@/renderer/AnimationManager';
import { AnimationState } from '@/entity/components/Animatable';
import { getAnimationDuration } from '@/renderer/renderableUtils';

export const TrapState = {
  IDLE: 'idle',
  CLOSING: 'closing',
  FIRED: 'fired',
  CAN_HURT: 'canHurt',
  USED: 'used'
} as const;
export type TrapState = Values<typeof TrapState>;

export const TrapStateTransitions = {
  ATTACK: 'attack',
  INFLICTED: 'inflicted'
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
            [TrapStateTransitions.ATTACK]: TrapState.CLOSING
          },
          entry: () => {
            scheduleAnimation(entity.entity_id, {
              spriteName: entity.animatable.spriteName,
              state: AnimationState.IDLE
            });
          }
        },
        [TrapState.CLOSING]: {
          entry: () => {
            scheduleAnimation(entity.entity_id, {
              spriteName: entity.animatable.spriteName,
              state: AnimationState.FIRED
            });
          },
          after: {
            ATTACK_OFFSET: {
              target: TrapState.CAN_HURT
            }
          }
        },
        [TrapState.CAN_HURT]: {
          on: {
            [TrapStateTransitions.INFLICTED]: TrapState.USED
          },
          after: {
            ATTACK_OFFSET: {
              target: TrapState.IDLE
            }
          }
        },
        [TrapState.USED]: {
          entry: () => {
            scheduleAnimation(entity.entity_id, {
              spriteName: entity.animatable.spriteName,
              state: AnimationState.FIRED
            });
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
          ),
        ATTACK_OFFSET: () =>
          getAnimationDuration(
            entity.animatable.spriteName,
            AnimationState.FIRED
          ) / 2
      }
    }
  );

  return interpret(machine).start();
};
