import type { Application } from 'pixi.js';
import { Control, isControlOn } from './ControlsManager';
import { getEntityById } from './EntityManager';
import { movePlayer, Direction } from './PlayerEntity';
import type { TPlayerEntity } from './PlayerEntity';

export function createGameLoop(app: Application) {
  function tick() {
    const player = getEntityById('player')! as unknown as TPlayerEntity;
    if (isControlOn(Control.right)) {
      movePlayer(player, Direction.right);
    } else if (isControlOn(Control.left)) {
      movePlayer(player, Direction.left);
    }

    if (isControlOn(Control.up)) {
      movePlayer(player, Direction.up);
    } else if (isControlOn(Control.down)) {
      movePlayer(player, Direction.down);
    }

    window.requestAnimationFrame(tick);
  }
  window.requestAnimationFrame(tick);
}
