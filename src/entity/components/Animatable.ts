import type { ECSComponent } from '@/ecs/ECSComponent';
import type { ECSEntity } from '@/ecs/ECSEntity';
import type { SpriteName } from '@/renderer/createAnimatedSprite';
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
    spriteName: SpriteName;
    isDirty: boolean;
    options: AnimationOptions;
  }
>;

export function hasAnimatable<E extends ECSEntity>(e: E): e is E & Animatable {
  return AnimatableBrand in e;
}

export function animatableComponent(spriteName: SpriteName): Animatable {
  let _state: AnimationState = AnimationState.IDLE;
  // We need to track the dirtyness of the new animation state, otherwise the animation system will update and reset the texture on every tick
  let _isDirty = false;

  return {
    [AnimatableBrand]: {
      get state() {
        return _state;
      },
      set state(newState: AnimationState) {
        _isDirty = true;
        _state = newState;
      },
      get isDirty() {
        return _isDirty;
      },
      set isDirty(val: boolean) {
        _isDirty = val;
      },

      spriteName,

      options: {
        animationSpeed: 1,
        loop: true,
        fallbackOnComplete: null
      }
    }
  };
}

export const withAnimatable = (spriteName: SpriteName) => () =>
  animatableComponent(spriteName);
