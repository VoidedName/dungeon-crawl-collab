import type { Values } from '@/utils/types';
import type { TrapEntity } from '@/createTrap';
import { createMachine, interpret } from 'xstate';
import { scheduleAnimation } from '@/renderer/AnimationManager';
import { AnimationState } from '@/entity/components/Animatable';
import { getAnimationDuration } from '@/renderer/renderableUtils';

export const TrapState = {
  IDLE: 'idle',
  FIRED: 'fired',
  DAMAGEABLE: 'damageable',
  USED: 'used',
  COOL_DOWN: 'coolDown'
} as const;
export type TrapState = Values<typeof TrapState>;

export const TrapStateTransitions = {
  ATTACK: 'attack',
  USED: 'used'
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
          entry: () => {
            scheduleAnimation(entity.entity_id, {
              spriteName: entity.animatable.spriteName,
              state: AnimationState.FIRED
            });
          },
          after: {
            HALF_ATTACK_DURATION: {
              target: TrapState.DAMAGEABLE
            }
          }
        },
        [TrapState.DAMAGEABLE]: {
          on: {
            [TrapStateTransitions.USED]: `${TrapState.DAMAGEABLE}.${TrapState.USED}`
          },
          after: {
            HALF_ATTACK_DURATION: {
              target: TrapState.COOL_DOWN
            }
          },
          states: {
            [TrapState.USED]: {}
          }
        },
        [TrapState.COOL_DOWN]: {
          after: {
            ATTACK_COOLDOWN: {
              target: TrapState.IDLE
            }
          },
          entry: () => {
            scheduleAnimation(entity.entity_id, {
              spriteName: entity.animatable.spriteName,
              state: AnimationState.IDLE
            });
          }
        }
      }
    },
    {
      delays: {
        HALF_ATTACK_DURATION: () =>
          getAnimationDuration(
            entity.animatable.spriteName,
            AnimationState.FIRED
          ) / 2,
        ATTACK_COOLDOWN: () => 1000
      }
    }
  );

  return interpret(machine).start();
};
