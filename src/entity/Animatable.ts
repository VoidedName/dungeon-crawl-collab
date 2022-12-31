import type { ECSComponent } from '@/ecs/ECSComponent';
import type { ECSEntity } from '@/ecs/ECSEntity';
import type { Values } from '@/utils/types';

export const AnimationState = {
  IDLE: 'idle',
  RUNNING: 'running',
  ATTACKING: 'attacking'
} as const;
export type AnimationState = Values<typeof AnimationState>;

export const AnimatableBrand = 'animatable';
type AnimatableBrand = typeof AnimatableBrand;

export type Animatable = ECSComponent<
  AnimatableBrand,
  {
    animationState: AnimationState;
  }
>;

export function hasAnimatable<E extends ECSEntity>(e: E): e is E & Animatable {
  return AnimatableBrand in e;
}

export function animatableComponent(): Animatable {
  return {
    [AnimatableBrand]: {
      animationState: AnimationState.IDLE
    }
  };
}

export const withAnimatable = () => () => animatableComponent();
