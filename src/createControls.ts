import type { EventQueue } from './createEventQueue';
import { useKeydownOnce } from './composables/useKeydownOnce';
import { QUEUE_EVENTS, type GameLoopQueue } from './createGameLoop';

export const Controls = ['up', 'down', 'left', 'right', 'use'] as const;

export const movementControls = ['up', 'down', 'left', 'right'];
const isMovementControl = (key: string) => movementControls.includes(key);

export type Control = typeof Controls[number];

const configuration = {
  KeyD: 'right',
  KeyA: 'left',
  KeyW: 'up',
  KeyS: 'down',
  KeyE: 'use'
} as Record<string, Control>;

const controls = {
  up: false,
  down: false,
  left: false,
  right: false,
  use: false
};

export function getConfiguration() {
  return configuration;
}

export function setConfiguration(newConfiguration: any) {
  Object.assign(configuration, newConfiguration);
}

export function isControlOn(control: Control) {
  return controls[control] === true;
}

export function setControl(control: Control, isOn: boolean) {
  controls[control] = isOn;
}

export function getControls() {
  return controls;
}

export const createControls = (queue: GameLoopQueue) => {
  const handler = (val: boolean) => (e: KeyboardEvent) => {
    const control = configuration[e.code];
    if (!control) return;
    setControl(control, val);

    if (isMovementControl(control)) {
      queue.dispatch({
        type: QUEUE_EVENTS.KEYBOARD_MOVEMENT,
        payload: controls
      });
    }
  };

  const onKeyDown = handler(true);
  const onKeyUp = handler(false);

  useKeydownOnce(onKeyDown, window);
  window.addEventListener('keyup', onKeyUp);

  return {
    cleanup: () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    }
  };
};
