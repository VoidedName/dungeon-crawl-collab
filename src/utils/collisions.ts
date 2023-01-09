import type { ECSEntity } from '@/ecs/ECSEntity';
import type { Position } from '@/entity/components/Position';
import type { Size } from '@/entity/components/Size';
import type { Animatable } from '@/entity/components/Animatable';
import { getAnimationState } from '@/renderer/AnimationManager';
import { getSpriteHitbox, HitBoxId } from '@/renderer/renderableUtils';
import { dist } from './math';
import type { Circle, Point, Rectangle } from './types';
import type { Intersect } from './types';
import { TILE_SIZE } from '@/MapManager';
import { hasHitboxes } from '@/entity/components/HitBoxes';
import type { Maybe } from '@/utils/Maybe';
import type { GameMap } from '@/map/Map';

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

function getLimits(
  box: Maybe<Rectangle>,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number
): [number, number, number, number] {
  return box.match(
    box => [
      Math.min(xMin, Math.floor(box.x / TILE_SIZE)),
      Math.max(xMax, Math.floor((box.x + box.w) / TILE_SIZE)),
      Math.min(yMin, Math.floor(box.y / TILE_SIZE)),
      Math.max(yMax, Math.floor((box.y + box.h) / TILE_SIZE))
    ],
    () => [xMin, xMax, yMin, yMax]
  );
}

export function* getIntersectingTiles(
  e: ECSEntity & Intersect<[Position]>,
  map: GameMap
): Generator<[number, number]> {
  let xMin = Math.floor(e.position.x / TILE_SIZE);
  let xMax = xMin;
  let yMin = Math.floor(e.position.y / TILE_SIZE);
  let yMax = yMin;
  if (hasHitboxes(e)) {
    [xMin, xMax, yMin, yMax] = getLimits(
      e.hitboxes.movement,
      xMin,
      xMax,
      yMin,
      yMax
    );
    [xMin, xMax, yMin, yMax] = getLimits(
      e.hitboxes.damage,
      xMin,
      xMax,
      yMin,
      yMax
    );
    [xMin, xMax, yMin, yMax] = getLimits(
      e.hitboxes.hurt,
      xMin,
      xMax,
      yMin,
      yMax
    );
  }
  for (let x = Math.max(0, xMin); x < Math.min(xMax + 1, map.width); x++) {
    for (let y = Math.max(0, yMin); y < Math.min(yMax + 1, map.height); y++) {
      yield [x, y];
    }
  }
}

export const spriteCollision = (
  source: Readonly<ECSEntity & Animatable & Position & Size>,
  sink: Readonly<ECSEntity & Animatable & Position & Size>
) => {
  return rectRectCollision(
    getSpriteHitbox({
      entity: source,
      hitboxId: HitBoxId.BODY_COLLISION,
      animationState: getAnimationState(source.entity_id)!
    }),
    getSpriteHitbox({
      entity: sink,
      hitboxId: HitBoxId.BODY_COLLISION,
      animationState: getAnimationState(sink.entity_id)!
    })
  );
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
