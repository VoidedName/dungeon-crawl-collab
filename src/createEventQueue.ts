import type { AnyObject } from './utils/types';

export type EventQueueMap = Record<string, AnyObject>;
export type EventQueueEvent<T extends EventQueueMap, K extends keyof T> = {
  type: K;
  payload: T[K];
};

export type EventQueue<T extends EventQueueMap> = {
  dispatch: <E extends keyof T>(event: EventQueueEvent<T, E>) => void;
  process: () => void;
};

export const createEventQueue = <T extends EventQueueMap>(
  reducer: <E extends keyof T>(event: EventQueueEvent<T, E>) => void
): EventQueue<T> => {
  const events: EventQueueEvent<T, any>[] = [];

  return {
    dispatch<E extends keyof T>(event: EventQueueEvent<T, E>) {
      events.push(event);
    },

    process() {
      let e = events.shift();

      while (e) {
        reducer(e);

        e = events.shift();
      }
    }
  };
};
