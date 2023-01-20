import { Linear } from './easing';
import type { Point } from './types';

export const dist = (p1: Point, p2: Point) => {
  const diffX = p2.x - p1.x;
  const diffY = p2.y - p1.y;

  return Math.sqrt(diffX ** 2 + diffY ** 2);
};

export const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max);

export const lerp = (
  a: number,
  b: number,
  w: number,
  easing: (p: number) => number = Linear
) => a + (b - a) * easing(w);

export const deg2Rad = (degrees: number) => {
  return degrees * (Math.PI / 180);
};

export const rad2Deg = (radians: number) => {
  return (180 * radians) / Math.PI;
};

export const randomInRange = (min: number, max: number) =>
  min + Math.random() * (max - min);
