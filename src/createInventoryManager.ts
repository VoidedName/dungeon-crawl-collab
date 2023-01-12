import { codex } from './assets/codex';
import type { CodexItem } from './assets/types';
import { EventNames, type GameLoopQueue } from './createGameLoop';
import type { Nullable } from './utils/types';

export type TInventoryManager = ReturnType<typeof createInventoryManager>;

export type TItem = {
  item: CodexItem;
  isUseable: boolean;
};

export const BELT_SIZE = 8;

export type InventoryEvent = 'updated';
export type InventoryBelt = Nullable<TItem>[];

export function createInventoryManager(queue: GameLoopQueue) {
  const belt: InventoryBelt = Array.from<TItem>({ length: BELT_SIZE });
  belt[2] = {
    item: codex.items.healthPotion(),
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
      return [...belt];
    },
    setBeltItem(index: number, item: TItem) {
      belt[index] = item;
    },
    getBeltItem(index: number) {
      return belt[index];
    },
    isFull() {
      return belt.every(Boolean);
    },
    addItemToBelt(item: TItem) {
      const openIndex = belt.findIndex(value => !value);
      belt[openIndex] = item;
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
