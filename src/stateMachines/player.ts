import type { TAudioManager } from '@/createAudioManager';
import type { PlayerEntity } from '@/createPlayer';
import type { ECSWorld } from '@/ecs/ECSWorld';
import { AnimationState } from '@/entity/components/Animatable';
import { scheduleAnimation } from '@/renderer/AnimationManager';
import { resolveRenderable } from '@/renderer/renderableManager';
import { getAnimationDuration } from '@/renderer/renderableUtils';
import type { Values } from '@/utils/types';
import type { AnimatedSprite } from 'pixi.js';
import { createMachine, interpret } from 'xstate';

export const PlayerState = {
  IDLE: 'idle',
  RUNNING: 'running',
  ATTACKING: 'attacking',
  HIT: 'hit'
} as const;
export type PlayerState = Values<typeof PlayerState>;

export const PlayerStateTransitions = {
  RUN: 'run',
  STOP_RUN: 'stop run',
  ATTACK: 'attack',
  TAKE_DAMAGE: 'take damage'
} as const;
export type PlayerStateTransitions = Values<typeof PlayerStateTransitions>;

export type PlayerstateMachine = ReturnType<typeof createPlayerStateMachine>;

export const createPlayerStateMachine = (
  entity: PlayerEntity,
  world: ECSWorld
) => {
  const machine = createMachine(
    {
      id: 'player',
      initial: 'idle',
      predictableActionArguments: true,
      states: {
        [PlayerState.IDLE]: {
          on: {
            [PlayerStateTransitions.RUN]: PlayerState.RUNNING,
            [PlayerStateTransitions.ATTACK]: PlayerState.ATTACKING,
            [PlayerStateTransitions.TAKE_DAMAGE]: PlayerState.HIT
          },

          entry: () => {
            scheduleAnimation(entity.entity_id, {
              spriteName: entity.animatable.spriteName,
              state: AnimationState.IDLE
            });
          }
        },

        [PlayerState.RUNNING]: {
          on: {
            [PlayerStateTransitions.STOP_RUN]: PlayerState.IDLE,
            [PlayerStateTransitions.ATTACK]: PlayerState.ATTACKING,
            [PlayerStateTransitions.TAKE_DAMAGE]: PlayerState.HIT
          },

          entry: () => {
            scheduleAnimation(entity.entity_id, {
              spriteName: entity.animatable.spriteName,
              state: AnimationState.RUNNING
            });
          }
        },

        [PlayerState.ATTACKING]: {
          on: {
            [PlayerStateTransitions.TAKE_DAMAGE]: PlayerState.HIT
          },

          entry: () => {
            scheduleAnimation(entity.entity_id, {
              spriteName: entity.animatable.spriteName,
              state: AnimationState.ATTACKING,
              loop: false
            });
          },

          after: {
            // @FIXME I didn't manage to tell it "go back to the previous state". this is probably me being a noob at xstate
            // The current fix is to fire running events continuously on keydown, instead of doing it just once...meh
            ATTACK_DELAY: {
              target: PlayerState.IDLE
            }
          }
        },

        [PlayerState.HIT]: {
          entry: () => {
            scheduleAnimation(entity.entity_id, {
              spriteName: entity.animatable.spriteName,
              state: AnimationState.HIT,
              loop: false
            });

            world.get<TAudioManager>('audio').match(
              audioManager => {
                audioManager.play('ouch');
              },
              () => console.warn('no audio manager set')
            );
            const sprite = resolveRenderable<AnimatedSprite>(entity.entity_id);
            sprite.tint = 0xff0000;
          },

          exit: () => {
            const sprite = resolveRenderable<AnimatedSprite>(entity.entity_id);
            sprite.tint = 0xffffff;
          },

          after: {
            HIT_DELAY: {
              target: PlayerState.IDLE
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
            AnimationState.ATTACKING
          ),

        HIT_DELAY: () =>
          getAnimationDuration(entity.animatable.spriteName, AnimationState.HIT)
      }
    }
  );

  const interpreter = interpret(machine).start();

  return interpreter;
};
