import type { Application } from 'pixi.js';
import { EventNames, type GameLoopQueue } from './createGameLoop';
import { mulVector, subVector } from './utils/vectors';
import type { ECSWorld } from './ecs/ECSWorld';
import type { TInventoryManager } from './createInventoryManager';

export const Controls = [
  'up',
  'down',
  'left',
  'right',
  'use',
  'highlightInteractables',
  'toggleDebugMap',
  'toggleDebugHitboxes',
  'itemSlot1',
  'itemSlot2',
  'itemSlot3',
  'itemSlot4',
  'itemSlot5',
  'itemSlot6',
  'itemSlot7',
  'itemSlot8'
] as const;

export const movementControls = ['up', 'down', 'left', 'right'];
const isMovementControl = (key: Control) => movementControls.includes(key);
const isUseControl = (key: Control) => key === 'use';
const isHighlightInteractablesControl = (key: Control) =>
  key === 'highlightInteractables';
const isDebugControl = (key: Control) =>
  key === 'toggleDebugMap' || key === 'toggleDebugHitboxes';
const isItemControl = (key: Control) => [
  'itemSlot1',
  'itemSlot2',
  'itemSlot3',
  'itemSlot4',
  'itemSlot5',
  'itemSlot6',
  'itemSlot7',
  'itemSlot8'
];
export type Control = typeof Controls[number];

const configuration = {
  KeyD: 'right',
  KeyA: 'left',
  KeyW: 'up',
  KeyS: 'down',
  KeyE: 'use',
  Tab: 'highlightInteractables',
  Backquote: 'toggleDebugMap',
  F1: 'toggleDebugHitboxes',
  Digit1: 'itemSlot1',
  Digit2: 'itemSlot2',
  Digit3: 'itemSlot3',
  Digit4: 'itemSlot4',
  Digit5: 'itemSlot5',
  Digit6: 'itemSlot6',
  Digit7: 'itemSlot7',
  Digit8: 'itemSlot8'
} as Record<string, Control>;

const controls = {
  up: false,
  down: false,
  left: false,
  right: false,
  use: false,
  highlightInteractables: false,
  itemSlot1: false,
  itemSlot2: false,
  itemSlot3: false,
  itemSlot4: false,
  itemSlot5: false,
  itemSlot6: false,
  itemSlot7: false,
  itemSlot8: false,
  toggleDebugMap: false,
  toggleDebugHitboxes: false
};

export function getConfiguration() {
  return configuration;
}

export function setConfiguration(newConfiguration: any) {
  Object.assign(configuration, newConfiguration);
}

export function setControl(control: Control, isOn: boolean) {
  controls[control] = isOn;
}

export function getControls() {
  return controls;
}

export const createControls = (
  app: Application,
  queue: GameLoopQueue,
  ecs: ECSWorld
) => {
  const canvas = app.view as HTMLCanvasElement;
  app.stage.on('pointerdown', e => {
    queue.dispatch({
      type: EventNames.PLAYER_ATTACK,
      payload: e.global
    });
  });

  const keyboardHandler = (isOn: boolean) => (e: KeyboardEvent) => {
    e.preventDefault();
    const control = configuration[e.code];
    if (!control) return;
    setControl(control, isOn);

    if (isMovementControl(control)) {
      queue.dispatch({
        type: EventNames.KEYBOARD_MOVEMENT,
        payload: controls
      });
    }

    if (isUseControl(control)) {
      queue.dispatch({
        type: EventNames.PLAYER_INTERACT,
        payload: isOn
      });
    }

    if (isDebugControl(control) && isOn) {
      queue.dispatch({
        type: EventNames.TOGGLE_DEBUG_OVERLAY,
        payload: control === 'toggleDebugMap' ? 'map' : 'hitboxes'
      });
    }

    if (isHighlightInteractablesControl(control)) {
      queue.dispatch({
        type: EventNames.SET_HIGHLIGHT_INTERACTABLES,
        payload: isOn
      });
    }

    if (isItemControl(control)) {
      const inventoryManager = ecs.get<TInventoryManager>('inventory').unwrap();
      const itemIndex = Number(control.replace('itemSlot', ''));
      inventoryManager?.useBeltItem(itemIndex - 1);
    }
  };

  const onMousemove = (e: MouseEvent) => {
    const scaleFactor = -0.1;
    const rect = canvas.getBoundingClientRect();
    const mouse = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    const center = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };

    queue.dispatch({
      type: EventNames.SET_CAMERA_OFFSET,
      payload: mulVector(subVector(mouse, center), scaleFactor)
    });
  };
  const onKeyDown = keyboardHandler(true);
  const onKeyUp = keyboardHandler(false);

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('mousemove', onMousemove);

  return {
    cleanup: () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('mousemove', onMousemove);
    }
  };
};
