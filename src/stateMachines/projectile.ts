import { createMachine, interpret } from 'xstate';
import type { Values } from '@/utils/types';
import type { ECSWorld } from '@/ecs/ECSWorld';
import { AnimationState } from '@/entity/components/Animatable';
import { scheduleAnimation } from '@/renderer/AnimationManager';
import type { ProjectileEntity } from '@/entity/factories/createProjectile';

export const ProjectileState = {
  IDLE: 'idle',
  DEAD: 'dead'
} as const;
export type ProjectileState = Values<typeof ProjectileState>;

export const ProjectileStateTransitions = {
  DIE: 'die'
} as const;
export type ProjectileStateTransitions = Values<
  typeof ProjectileStateTransitions
>;

export type ProjectileStateMachine = ReturnType<
  typeof createProjectileStateMachine
>;

export const createProjectileStateMachine = (
  entity: ProjectileEntity,
  world: ECSWorld
) => {
  const machine = createMachine({
    id: 'player',
    initial: 'idle',
    predictableActionArguments: true,
    states: {
      [ProjectileState.IDLE]: {
        on: {
          [ProjectileStateTransitions.DIE]: ProjectileState.DEAD
        },

        entry: () => {
          scheduleAnimation(entity.entity_id, {
            spriteName: entity.animatable.spriteName,
            state: AnimationState.IDLE
          });
        }
      },
      [ProjectileState.DEAD]: {
        type: 'final',
        entry: () => {
          scheduleAnimation(entity.entity_id, {
            spriteName: entity.animatable.spriteName,
            state: AnimationState.DEAD
          });
        }
      }
    }
  });

  return interpret(machine).start();
};
