import { useKeydownOnce } from './composables/useKeydownOnce';
import { EventNames, type GameLoopQueue } from './createGameLoop';

export const Controls = [
  'up',
  'down',
  'left',
  'right',
  'use',
  'seppuku',
  'toggleDebug'
] as const;

export const movementControls = ['up', 'down', 'left', 'right'];
const isMovementControl = (key: Control) => movementControls.includes(key);
const isUseControl = (key: Control) => key === 'use';

// TODO: this is a temp way to hurt the player, will be removed soon
const isSeppukuControl = (key: Control) => key === 'seppuku';
const isDebugControl = (key: Control) => key === 'toggleDebug';

export type Control = typeof Controls[number];

const configuration = {
  KeyD: 'right',
  KeyA: 'left',
  KeyW: 'up',
  KeyS: 'down',
  KeyE: 'use',
  KeyP: 'seppuku',
  Backquote: 'toggleDebug'
} as Record<string, Control>;

const controls = {
  up: false,
  down: false,
  left: false,
  right: false,
  use: false,
  seppuku: false,
  toggleDebug: false
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

export const createControls = (queue: GameLoopQueue) => {
  const handler = (isKeyDown: boolean) => (e: KeyboardEvent) => {
    const control = configuration[e.code];
    if (!control) return;
    setControl(control, isKeyDown);

    if (isMovementControl(control)) {
      queue.dispatch({
        type: EventNames.KEYBOARD_MOVEMENT,
        payload: controls
      });
    }
    if (isUseControl(control)) {
      queue.dispatch({
        type: EventNames.PLAYER_INTERACT,
        payload: isKeyDown
      });
    }
    if (isSeppukuControl(control) && isKeyDown) {
      queue.dispatch({
        type: EventNames.PLAYER_DAMAGED,
        payload: 1
      });
    }

    if (isDebugControl(control) && isKeyDown) {
      queue.dispatch({
        type: EventNames.TOGGLE_DEBUG_OVERLAY,
        payload: undefined
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
