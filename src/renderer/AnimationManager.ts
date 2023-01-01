import type { AnimatedSprite } from 'pixi.js';
import { resolveSprite, type RenderableId } from './renderableCache';
import { updateTextures, type SpriteName } from './createAnimatedSprite';
import type { AnimationState } from '../entity/components/Animatable';
import type { Nullable } from 'vitest';
import { noop } from '@vueuse/core';

export type AnimationScheduler = {
  schedule: (
    options: AnimationRequiredOptions & Partial<AnimationOptionals>
  ) => void;
  getState: () => Nullable<AnimationState>;
};

type AnimationOptionals = {
  loop: boolean;
  minLoopIterationCount: 0;
  onEnter: () => void;
  onExit: () => void;
};
type AnimationRequiredOptions = {
  spriteName: SpriteName;
  state: AnimationState;
};
type AnimationOptions = AnimationRequiredOptions & AnimationOptionals;

const schedulersCache = new Map<RenderableId, AnimationScheduler>();

const getScheduler = (id: RenderableId) => {
  if (!schedulersCache.has(id)) {
    schedulersCache.set(
      id,
      createScheduler(id, { resolveSprite, updateTextures })
    );
  }

  return schedulersCache.get(id)!;
};

type CreateSchedulerOptions = {
  resolveSprite: (id: RenderableId) => AnimatedSprite;
  updateTextures: (
    id: RenderableId,
    spriteName: SpriteName,
    animation: AnimationState
  ) => Promise<void>;
};

const defaultOptions: AnimationOptionals = {
  loop: true,
  minLoopIterationCount: 0,
  onExit: noop,
  onEnter: noop
};

export const createScheduler = (
  id: RenderableId,
  { resolveSprite, updateTextures }: CreateSchedulerOptions
): AnimationScheduler => {
  const sprite = resolveSprite(id);
  const queue: AnimationOptions[] = [];

  let current: Nullable<AnimationOptions> = null;
  let currentIterationCount = 0;

  const shouldSkip = () => {
    if (!current) return true;
    return (
      current.loop &&
      (current.minLoopIterationCount === 0 ||
        current.minLoopIterationCount < currentIterationCount)
    );
  };
  const next = () => {
    if (!current) return;

    current.onExit();
    if (queue.length) {
      animate();
    }
  };
  sprite.onComplete = next;

  const animate = () => {
    current = queue.shift();
    if (!isDefined(current)) return;
    current.onEnter();
    currentIterationCount = 0;

    sprite.loop = current.loop;
    sprite.onLoop = () => {
      currentIterationCount++;
      if (currentIterationCount >= (current?.minLoopIterationCount ?? 0)) {
        next();
      }
    };

    updateTextures(id, current.spriteName, current.state);
    if (shouldSkip()) next();
  };

  const schedule = (
    options: AnimationRequiredOptions & Partial<AnimationOptionals>
  ) => {
    const latest = queue.at(-1);

    if (options.state === latest?.state) return;

    queue.push({ ...defaultOptions, ...options });
    if (!current || shouldSkip()) {
      animate();
    }
  };

  const getState = () => current?.state;

  return { schedule, getState };
};

export const scheduleAnimation = (
  id: RenderableId,
  options: AnimationRequiredOptions & Partial<AnimationOptionals>
) => {
  const scheduler = getScheduler(id);

  return scheduler.schedule(options);
};

export const getAnimationState = (id: RenderableId) => {
  const scheduler = getScheduler(id);

  return scheduler.getState();
};
