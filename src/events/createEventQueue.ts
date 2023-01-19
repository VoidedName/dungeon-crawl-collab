import type { TItem } from '../createInventoryManager';
import type { ECSEntityId } from '../ecs/ECSEntity';
import type { Directions } from './handlers/keyboardMovementHandler';
import type { DebugFlags } from '../systems/DebugRenderer';
import type { AnyObject, Point, Values } from '../utils/types';

export type EventQueueMap = Record<string, AnyObject>;
export type EventQueueEvent = {
  type: string;
  payload: any;
};

export type EventQueue<T extends EventQueueEvent> = {
  dispatch: (event: T) => void;
  process: () => void;
};

// @TODO maybe we should externalize all the queue related code to its own file...we might end up with a lot of different events
export const EventNames = {
  KEYBOARD_MOVEMENT: 'KEYBOARD_MOVEMENT',
  PLAYER_ATTACK: 'PLAYER_ATTACK',
  PLAYER_INTERACT: 'PLAYER_INTERACT',
  TOGGLE_DEBUG_OVERLAY: 'TOGGLE_DEBUG_OVERLAY',
  SET_CAMERA_OFFSET: 'SET_CAMERA_OFFSET',
  DAMAGE: 'DAMAGE',
  USE_ITEM: 'USE_ITEM',
  DROP_ITEM: 'DROP_ITEM',
  SET_HIGHLIGHT_INTERACTABLES: 'SET_HIGHLIGHT_INTERACTABLES'
} as const;

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

export type EventNames = Values<typeof EventNames>;

type KeyboardMovementEvent = {
  type: typeof EventNames.KEYBOARD_MOVEMENT;
  payload: Directions;
};

type PlayerAttackEvent = {
  type: typeof EventNames.PLAYER_ATTACK;
  payload: Point;
};

type PlayerInteractEvent = {
  type: typeof EventNames.PLAYER_INTERACT;
  payload: any;
};

type ToggleDebugOverlayEvent = {
  type: typeof EventNames.TOGGLE_DEBUG_OVERLAY;
  payload: keyof DebugFlags;
};

type SetCameraOffsetEvent = {
  type: typeof EventNames.SET_CAMERA_OFFSET;
  payload: Point;
};

type DamageEvent = {
  type: typeof EventNames.DAMAGE;
  payload: {
    damage: number;
    entityId: ECSEntityId;
  };
};

type UseItemEvent = {
  type: typeof EventNames.USE_ITEM;
  payload: TItem;
};

type DropItemEvent = {
  type: typeof EventNames.DROP_ITEM;
  payload: TItem;
};

type HighlightInteractablesEvent = {
  type: typeof EventNames.SET_HIGHLIGHT_INTERACTABLES;
  payload: boolean;
};

export type QueueEvent =
  | KeyboardMovementEvent
  | PlayerAttackEvent
  | PlayerInteractEvent
  | ToggleDebugOverlayEvent
  | SetCameraOffsetEvent
  | DamageEvent
  | UseItemEvent
  | DropItemEvent
  | HighlightInteractablesEvent;

export type GameLoopQueue = EventQueue<QueueEvent>;
