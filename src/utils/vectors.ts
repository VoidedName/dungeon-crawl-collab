import type { Point } from './types';

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
