import { useKeydownOnce } from './composables/useKeydownOnce';
import { EventNames, type GameLoopQueue } from './createGameLoop';
import { mulVector } from './utils/vectors';

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

export const createControls = (
  canvas: HTMLCanvasElement,
  queue: GameLoopQueue
) => {
  const keyboardHandler = (isOn: boolean) => (e: KeyboardEvent) => {
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
    if (isSeppukuControl(control) && isOn) {
      queue.dispatch({
        type: EventNames.PLAYER_DAMAGED,
        payload: 1
      });
    }

    if (isDebugControl(control) && isOn) {
      queue.dispatch({
        type: EventNames.TOGGLE_DEBUG_OVERLAY,
        payload: undefined
      });
    }
  };

  const onMousemove = (e: MouseEvent) => {
    const offsetThreshold = 100;
    const scaleFactor = 1.5;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const offset = { x: 0, y: 0 };
    if (mouseX < offsetThreshold) {
      offset.x = offsetThreshold - mouseX;
    }
    if (rect.width - mouseX < offsetThreshold) {
      offset.x = -(offsetThreshold - (rect.width - mouseX));
    }
    if (mouseY < offsetThreshold) {
      offset.y = offsetThreshold - mouseY;
    }
    if (rect.height - mouseY < offsetThreshold) {
      offset.y = -(offsetThreshold - (rect.height - mouseY));
    }
    queue.dispatch({
      type: EventNames.SET_CAMERA_OFFSET,
      payload: mulVector(offset, scaleFactor)
    });
  };
  const onKeyDown = keyboardHandler(true);
  const onKeyUp = keyboardHandler(false);

  useKeydownOnce(onKeyDown, window);
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
