import type { AngleInDegrees } from '@/entity/components/Orientation';
import type { Point } from './types';
import { rad2Deg } from './math';

export const addVector = (vec1: Point, vec2: Point) => ({
  x: vec1.x + vec2.x,
  y: vec1.y + vec2.y
});

export const subVector = (vec1: Point, vec2: Point) => ({
  x: vec1.x - vec2.x,
  y: vec1.y - vec2.y
});

export const mulVector = (vec: Point, val: Point | number) => {
  if (typeof val === 'number') {
    return {
      x: vec.x * val,
      y: vec.y * val
    };
  }

  return {
    x: vec.x * val.x,
    y: vec.y * val.y
  };
};

export const divVector = (vec: Point, val: Point | number) => {
  if (typeof val === 'number') {
    return {
      x: vec.x / val,
      y: vec.y / val
    };
  }

  return {
    x: vec.x / val.x,
    y: vec.y / val.y
  };
};

export const toAngle = (vec: Point): AngleInDegrees => {
  const radians = Math.atan2(vec.y, vec.x);

  return (360 + Math.round(rad2Deg(radians))) % 360;
};

export const normalizeVector = ({ x, y }: Point) => {
  const len = Math.hypot(x, y);
  if (len === 0)
    return {
      x: 0,
      y: 0
    };
  return { x: x / len, y: y / len };
};

export const setMagnitude = (vec: Point, speed: number) => {
  return mulVector(normalizeVector(vec), speed);
};
