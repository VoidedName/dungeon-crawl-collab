import type { AnyObject } from './utils/types';

export type EventQueueMap = Record<string, AnyObject>;
export type EventQueueEvent = {
  type: string;
  payload: any;
};

export type EventQueue<T extends EventQueueEvent> = {
  dispatch: (event: T) => void;
  process: () => void;
};

export const createEventQueue = <T extends EventQueueEvent>(
  reducer: (event: T) => void
): EventQueue<T> => {
  const events: T[] = [];

  return {
    dispatch(event: T) {
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
