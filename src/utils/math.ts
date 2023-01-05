import type { Point } from './types';

export const dist = (p1: Point, p2: Point) => {
  const diffX = p2.x - p1.x;
  const diffY = p2.y - p1.y;

  return Math.sqrt(diffX ** 2 + diffY ** 2);
};

export const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max);

export const lerp = (a: number, b: number, w: number) => a + (b - a) * w;
