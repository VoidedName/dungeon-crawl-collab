import type { EventQueueHandler } from '@/createGameLoop';

export const keyboardMovementHandler: EventQueueHandler = (event, world) => {
  console.log(event, world);
};
