import { EventNames, type GameLoopQueue } from './createGameLoop';

export type TInventoryManager = ReturnType<typeof createInventoryManager>;

export type items = 'potion';

export type TItem = {
  name: items;
  isUseable: boolean;
};

export const BELT_SIZE = 8;

export type InventoryEvent = 'updated';

export function createInventoryManager(queue: GameLoopQueue) {
  const belt: (TItem | undefined)[] = new Array(BELT_SIZE).fill(undefined);
  belt[2] = {
    name: 'potion',
    isUseable: true
  };

  const listeners: ((event: InventoryEvent) => void)[] = [];

  function emit(event: InventoryEvent) {
    for (const listener of listeners) {
      listener(event);
    }
  }

  return {
    getBelt() {
      return belt.map(item => ({ ...item }));
    },
    setBeltItem(index: number, item: TItem) {
      belt[index] = item;
    },
    getBeltItem(index: number) {
      return belt[index];
    },
    useBeltItem(index: number) {
      const item = belt[index];
      if (item?.isUseable) {
        queue.dispatch({
          type: EventNames.USE_ITEM,
          payload: item
        });
        belt[index] = undefined;
      }
      emit('updated');
    },
    on(cb: (event: InventoryEvent) => void) {
      listeners.push(cb);
    }
  };
}
