import type { ECSComponent } from '@/ecs/ECSComponent';
import type { ECSEntity } from '@/ecs/ECSEntity';
import type { Nullable, Values } from '@/utils/types';

export const AnimationState = {
  IDLE: 'idle',
  RUNNING: 'running',
  ATTACKING: 'attacking'
} as const;
export type AnimationState = Values<typeof AnimationState>;

export type AnimationOptions = {
  loop: boolean;
  animationSpeed: number;
  fallbackOnComplete: Nullable<AnimationState>;
};

export const AnimatableBrand = 'animatable';
type AnimatableBrand = typeof AnimatableBrand;

export type Animatable = ECSComponent<
  AnimatableBrand,
  {
    state: AnimationState;
    options: AnimationOptions;
  }
>;

export function hasAnimatable<E extends ECSEntity>(e: E): e is E & Animatable {
  return AnimatableBrand in e;
}

export function animatableComponent(): Animatable {
  return {
    [AnimatableBrand]: {
      state: AnimationState.IDLE,
      options: {
        animationSpeed: 1,
        loop: true,
        fallbackOnComplete: null
      }
    }
  };
}

export const withAnimatable = () => () => animatableComponent();
