import type { Interpreter } from 'xstate';
import type { AnyObject } from './types';
import { isObject } from '@vue/shared';

// eslint-disable-next-line @typescript-eslint/ban-types
export const throttle = (fn: Function, wait = 300) => {
  let inThrottle: boolean,
    lastFn: ReturnType<typeof setTimeout>,
    lastTime: number;
  return function (this: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-this-alias
    const context = this,
      // eslint-disable-next-line prefer-rest-params
      args = arguments;
    if (!inThrottle) {
      fn.apply(context, args);
      lastTime = Date.now();
      inThrottle = true;
    } else {
      clearTimeout(lastFn);
      lastFn = setTimeout(() => {
        if (Date.now() - lastTime >= wait) {
          fn.apply(context, args);
          lastTime = Date.now();
        }
      }, Math.max(wait - (Date.now() - lastTime), 0));
    }
  };
};

// type safe Object.assign
export const objectAssign = <T extends AnyObject>(
  obj: T,
  ...partials: Partial<T>[]
): T => Object.assign(obj, ...partials);

export const noop = () => void 0;
