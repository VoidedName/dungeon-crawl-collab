import type { Direction } from '@/eventHandlers/keyboardMovement';
import { dist } from './math';
import type { Circle, Nullable, Point, Rectangle } from './types';

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
): Nullable<Direction> => {
  if (rect1.x < rect2.x + rect2.w) return 'right';
  if (rect1.x + rect1.w > rect2.x) return 'left';

  if (rect1.y < rect2.y + rect2.h) return 'down';
  if (rect1.h + rect1.y > rect2.y) return 'up';

  return null;
};
