import type { Values } from '@/utils/types';
import type { TrapEntity } from '@/entity/factories/createTrap';
import { createMachine, interpret } from 'xstate';
import { scheduleAnimation } from '@/renderer/AnimationManager';
import { AnimationState } from '@/entity/components/Animatable';
import { getAnimationDuration } from '@/renderer/renderableUtils';
import { resolveRenderable } from '@/renderer/renderableManager';
import type { Sprite } from 'pixi.js';

export const TrapState = {
  IDLE: 'idle',
  TRIGGERED: 'triggered',
  ACTIVATING: 'activating',
  READY: 'ready',
  COOL_DOWN: 'coolDown'
} as const;
export type TrapState = Values<typeof TrapState>;

export const TrapReadyState = {
  CAN_REACH_PLAYER: 'can_reach',
  HAS_REACHED_PLAYER: 'has_reached_player'
} as const;
export type TrapReadyState = Values<typeof TrapReadyState>;

export const TrapStateTransitions = {
  TRIGGER: 'trigger',
  REACHED_PLAYER: 'reached_player'
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
            [TrapStateTransitions.TRIGGER]: TrapState.TRIGGERED
          },
          entry: () => {
            const sprite = resolveRenderable(entity.entity_id) as Sprite;
            sprite.tint = 0xffffff;
            scheduleAnimation(entity.entity_id, {
              spriteName: entity.animatable.spriteName,
              state: AnimationState.IDLE
            });
          }
        },
        [TrapState.TRIGGERED]: {
          entry: () => {
            scheduleAnimation(entity.entity_id, {
              spriteName: entity.animatable.spriteName,
              state: AnimationState.TRIGGERED,
              loop: false
            });
          },
          after: {
            ACTIVATION_DELAY: {
              target: TrapState.READY
            }
          }
        },
        [TrapState.READY]: {
          initial: TrapReadyState.CAN_REACH_PLAYER,
          states: {
            [TrapReadyState.CAN_REACH_PLAYER]: {},
            [TrapReadyState.HAS_REACHED_PLAYER]: {}
          },

          after: {
            READY_DELAY: {
              target: TrapState.COOL_DOWN
            }
          }
        },
        [TrapState.COOL_DOWN]: {
          after: {
            ATTACK_COOLDOWN: {
              target: TrapState.IDLE
            }
          },
          entry: () => {
            const sprite = resolveRenderable(entity.entity_id) as Sprite;
            sprite.tint = 0x555555;
            scheduleAnimation(entity.entity_id, {
              spriteName: entity.animatable.spriteName,
              state: AnimationState.IDLE
            });
          }
        }
      },
      on: {
        [TrapStateTransitions.REACHED_PLAYER]: TrapState.COOL_DOWN
      }
    },
    {
      delays: {
        ACTIVATION_DELAY: () =>
          getAnimationDuration(
            entity.animatable.spriteName,
            AnimationState.ACTIVATING
          ),
        READY_DELAY: () =>
          getAnimationDuration(
            entity.animatable.spriteName,
            AnimationState.READY
          ),
        ATTACK_COOLDOWN: () => 1000
      }
    }
  );

  return interpret(machine).start();
};
