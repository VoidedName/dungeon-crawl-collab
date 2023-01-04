import type { ECSComponent } from '@/ecs/ECSComponent';
import type { ECSEntity } from '@/ecs/ECSEntity';
import type { SpriteName } from '@/renderer/createAnimatedSprite';
import { PlayerState } from '@/stateMachines/player';
import { TrapState } from '@/stateMachines/trap';
import type { Values } from '@/utils/types';

export const AnimationState = { ...PlayerState, ...TrapState };
export type AnimationState = Values<typeof AnimationState>;

export const AnimatableBrand = 'animatable';
type AnimatableBrand = typeof AnimatableBrand;

export type Animatable = ECSComponent<
  AnimatableBrand,
  {
    spriteName: SpriteName;
  }
>;

export function hasAnimatable<E extends ECSEntity>(e: E): e is E & Animatable {
  return AnimatableBrand in e;
}

export const withAnimatable = (spriteName: SpriteName) => (): Animatable => ({
  [AnimatableBrand]: {
    spriteName
  }
});
