import type { DisplayObject } from 'pixi.js';
import type { TEntity } from './EntityManager';

export const PLAYER_SPEED = 2.6;

export type Direction = 'up' | 'down' | 'left' | 'right';

export type TPlayerEntity = {
  speed: number;
  sprite: DisplayObject;
} & TEntity;
