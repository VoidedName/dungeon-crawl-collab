import type { DisplayObject } from 'pixi.js';
import { isControlOn } from './createControls';
import type { TEntity } from './EntityManager';

export const PLAYER_SPEED = 2.6;

export type Direction = 'up' | 'down' | 'left' | 'right';

export type TPlayerEntity = {
  speed: number;
  sprite: DisplayObject;
} & TEntity;

function normalize({ x, y }: { x: number; y: number }) {
  const len = Math.hypot(x, y);
  if (len === 0)
    return {
      x: 0,
      y: 0
    };
  return { x: x / len, y: y / len };
}

export function tryPlayerMove(): { x: number; y: number } {
  let dx = 0;
  let dy = 0;
  if (isControlOn('right')) {
    dx += 1;
  }
  if (isControlOn('left')) {
    dx -= 1;
  }
  if (isControlOn('up')) {
    dy -= 1;
  }
  if (isControlOn('down')) {
    dy += 1;
  }
  const normalized = normalize({ x: dx, y: dy });
  return { x: normalized.x * 5, y: normalized.y * 5 };
}
