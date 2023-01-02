import { dist } from './math';
import type { Circle, Point, Rectangle } from './types';

export const pointRectCollision = (point: Point, rect: Rectangle) =>
  point.x >= rect.x &&
  point.x <= rect.x + rect.w &&
  point.y >= rect.y &&
  point.y <= rect.y + rect.h;

export const pointCircleCollision = (point: Point, circle: Circle) =>
  dist(point, circle) <= circle.r;

export const circleRectCollision = (circle: Circle, rect: Rectangle) => {
  const distX = Math.abs(circle.x - rect.x - rect.w / 2);
  const distY = Math.abs(circle.y - rect.y - rect.h / 2);

  if (distX > rect.w / 2 + circle.r) {
    return false;
  }
  if (distY > rect.h / 2 + circle.r) {
    return false;
  }

  if (distX <= rect.w / 2) {
    return true;
  }
  if (distY <= rect.h / 2) {
    return true;
  }

  const dx = distX - rect.w / 2;
  const dy = distY - rect.h / 2;

  return dx * dx + dy * dy <= circle.r * circle.r;
};

export const rectRectCollision = (rect1: Rectangle, rect2: Rectangle) =>
  rect1.x < rect2.x + rect2.w &&
  rect1.x + rect1.w > rect2.x &&
  rect1.y < rect2.y + rect2.h &&
  rect1.h + rect1.y > rect2.y;

export const directionAwareRectRectCollision = (
  rect1: Rectangle,
  rect2: Rectangle
): { up: number; down: number; left: number; right: number } => {
  if (!rectRectCollision(rect1, rect2)) {
    return { left: 0, right: 0, up: 0, down: 0 };
  }

  return {
    left: rect2.x < rect1.x ? 0 : rect1.w - (rect2.x - rect1.x),
    right: rect1.x < rect2.x ? 0 : rect2.w - (rect1.x - rect2.x),
    up: rect2.y < rect1.y ? 0 : rect1.h - (rect2.y - rect1.y),
    down: rect1.y < rect2.y ? 0 : rect2.h - (rect1.y - rect2.y)
  };
};
