export enum Control {
  up = 'up',
  down = 'down',
  left = 'left',
  right = 'right',
  use = 'use'
}

const configuration: Record<string, Control> = {
  KeyD: Control.right,
  KeyA: Control.left,
  KeyW: Control.up,
  KeyS: Control.down,
  KeyE: Control.use
};

const controls = {
  [Control.up]: false,
  [Control.down]: false,
  [Control.left]: false,
  [Control.right]: false,
  [Control.use]: false
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
  if (Object.values(Control).includes(control)) {
    controls[control] = isOn;
  }
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
