import type { PlayerEntity } from '@/createPlayer';
import { AnimationState } from '@/entity/components/Animatable';
import { scheduleAnimation } from '@/renderer/AnimationManager';
import type { Values } from '@/utils/types';
import { createMachine, interpret } from 'xstate';

export const PlayerState = {
  IDLE: 'idle',
  RUNNING: 'running',
  ATTACKING: 'attacking'
} as const;
export type PlayerState = Values<typeof PlayerState>;

export const PlayerStateTransitions = {
  RUN: 'run',
  STOP_RUN: 'stop run',
  ATTACK: 'attack',
  STOP_ATTACK: 'stop attack'
} as const;
export type PlayerStateTransitions = Values<typeof PlayerStateTransitions>;

export type PlayerstateMachine = ReturnType<typeof createPlayerStateMachine>;

export const createPlayerStateMachine = (entity: PlayerEntity) => {
  const machine = createMachine({
    id: 'player',
    initial: 'idle',
    states: {
      [PlayerState.IDLE]: {
        entry: () => {
          scheduleAnimation(entity.entity_id, {
            spriteName: entity.animatable.spriteName,
            state: AnimationState.IDLE
          });
        },

        on: {
          [PlayerStateTransitions.RUN]: PlayerState.RUNNING,
          [PlayerStateTransitions.ATTACK]: PlayerState.ATTACKING
        }
      },
      [PlayerState.RUNNING]: {
        entry: () => {
          scheduleAnimation(entity.entity_id, {
            spriteName: entity.animatable.spriteName,
            state: AnimationState.RUNNING
          });
        },

        on: {
          [PlayerStateTransitions.STOP_RUN]: PlayerState.IDLE,
          [PlayerStateTransitions.ATTACK]: PlayerState.ATTACKING
        }
      },
      [PlayerState.ATTACKING]: {
        entry: () => {
          scheduleAnimation(entity.entity_id, {
            spriteName: entity.animatable.spriteName,
            state: AnimationState.ATTACKING
          });
        },

        on: {
          [PlayerStateTransitions.STOP_ATTACK]: PlayerState.IDLE
        }
      }
    }
  });

  return interpret(machine);
};
