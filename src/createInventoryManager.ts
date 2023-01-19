import type { CodexItem } from './assets/types';
import type { TAudioManager } from './createAudioManager';
import type { ECSEntityId } from './ecs/ECSEntity';
import type { ECSWorld } from './ecs/ECSWorld';
import { type GameLoopQueue, EventNames } from './events/createEventQueue';
import type { Nullable } from './utils/types';

export type TInventoryManager = ReturnType<typeof createInventoryManager>;

export type TItem = {
  item: CodexItem;
  entityId: ECSEntityId;
  isUseable: boolean;
};

export const BELT_SIZE = 8;

export type InventoryEvent = 'updated';
export type InventoryBelt = Nullable<TItem>[];

export function createInventoryManager(world: ECSWorld, queue: GameLoopQueue) {
  const belt: InventoryBelt = Array.from<TItem>({ length: BELT_SIZE });

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
    dropBeltItem(index: number) {
      queue.dispatch({
        type: EventNames.DROP_ITEM,
        payload: belt[index]!
      });
      belt[index] = undefined;
      world.get<TAudioManager>('audio').unwrap().play('drop');
      emit('updated');
    },
    isFull() {
      return belt.every(Boolean);
    },
    addItemToBelt(item: TItem) {
      const openIndex = belt.findIndex(value => !value);
      belt[openIndex] = item;
      emit('updated');
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
