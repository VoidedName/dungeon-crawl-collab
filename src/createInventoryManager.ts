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
export const STASH_SIZE = 20;
export const EQUIPMENT_SIZE = 6;

export type InventoryEvent = 'updated';
export type InventoryBelt = Nullable<TItem>[];
export type InventoryStash = Nullable<TItem>[];
export type EquipmentSlots = Nullable<TItem>[];

export function createInventoryManager(world: ECSWorld, queue: GameLoopQueue) {
  const belt: InventoryBelt = Array.from<TItem>({ length: BELT_SIZE });
  const stash: InventoryStash = Array.from<TItem>({ length: STASH_SIZE });
  const equipment: EquipmentSlots = Array.from<TItem>({
    length: EQUIPMENT_SIZE
  });

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
    swapItem(from: string, fromIndex: number, to: string, toIndex: number) {
      const fromArr = {
        belt: belt,
        stash: stash
      }[from]!;
      const toArr = {
        belt: belt,
        stash: stash
      }[to]!;
      const tmp = toArr[toIndex];
      toArr[toIndex] = fromArr[fromIndex];
      fromArr[fromIndex] = tmp;
      emit('updated');
    },
    dropStashItem(index: number) {
      queue.dispatch({
        type: EventNames.DROP_ITEM,
        payload: stash[index]!
      });
      stash[index] = undefined;
      world.get<TAudioManager>('audio').unwrap().play('drop');
      emit('updated');
    },
    isBeltFull() {
      return belt.every(Boolean);
    },
    isStashFull() {
      return stash.every(Boolean);
    },
    getStash() {
      return [...stash];
    },
    getEquipment() {
      return [...equipment];
    },
    addItemToBelt(item: TItem) {
      const openIndex = belt.findIndex(value => !value);
      belt[openIndex] = item;
      emit('updated');
    },
    addItemToStash(item: TItem) {
      const openIndex = stash.findIndex(value => !value);
      stash[openIndex] = item;
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
    useStashItem(index: number) {
      const item = stash[index];
      if (item?.isUseable) {
        queue.dispatch({
          type: EventNames.USE_ITEM,
          payload: item
        });
        stash[index] = undefined;
      }
      emit('updated');
    },
    on(cb: (event: InventoryEvent) => void) {
      listeners.push(cb);
    }
  };
}
