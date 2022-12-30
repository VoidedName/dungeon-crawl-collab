export const Controls = ['up', 'down', 'left', 'right', 'use'] as const;
export type Control = typeof Controls[number];

const configuration = {
  KeyD: 'right',
  KeyA: 'left',
  KeyW: 'up',
  KeyS: 'down',
  KeyE: 'use'
} as Record<string, Control>;

const controls = {
  ['up']: false,
  ['down']: false,
  ['left']: false,
  ['right']: false,
  ['use']: false
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

window.addEventListener('keydown', function (e: KeyboardEvent) {
  const control = configuration[e.code];
  if (control) {
    setControl(control, true);
  }
});

window.addEventListener('keyup', function (e: KeyboardEvent) {
  const control = configuration[e.code];
  if (control) {
    setControl(control, false);
  }
});
