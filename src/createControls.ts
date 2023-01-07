import type { Application } from 'pixi.js';
import { EventNames, type GameLoopQueue } from './createGameLoop';
import { mulVector, subVector } from './utils/vectors';

export const Controls = [
  'up',
  'down',
  'left',
  'right',
  'use',
  'toggleDebug'
] as const;

export const movementControls = ['up', 'down', 'left', 'right'];
const isMovementControl = (key: Control) => movementControls.includes(key);
const isUseControl = (key: Control) => key === 'use';
const isDebugControl = (key: Control) => key === 'toggleDebug';

export type Control = typeof Controls[number];

const configuration = {
  KeyD: 'right',
  KeyA: 'left',
  KeyW: 'up',
  KeyS: 'down',
  KeyE: 'use',
  Backquote: 'toggleDebug'
} as Record<string, Control>;

const controls = {
  up: false,
  down: false,
  left: false,
  right: false,
  use: false,
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

export const createControls = (app: Application, queue: GameLoopQueue) => {
  const canvas = app.view as HTMLCanvasElement;
  app.stage.on('pointerdown', e => {
    queue.dispatch({
      type: EventNames.PLAYER_ATTACK,
      payload: e.global
    });
  });

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
    if (isDebugControl(control) && isOn) {
      queue.dispatch({
        type: EventNames.TOGGLE_DEBUG_OVERLAY,
        payload: undefined
      });
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
