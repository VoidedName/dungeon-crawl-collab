export type ECSEvent = 'ready' | 'playerUpdate';

export type ECSEmitter = (event: ECSEvent) => void;
export type ECSListener = (event: ECSEvent) => void;

export function createExternalQueue() {
  const listeners: ECSListener[] = [];

  function emit(event: ECSEvent) {
    for (const listener of listeners) {
      listener(event);
    }
  }

  function on(cb: ECSListener) {
    listeners.push(cb);
  }

  return { emit, on };
}
