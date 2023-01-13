import type { ECSSystem } from '@/ecs/ECSSystem';
import type { Position } from '@/entity/components/Position';
import type { HitBoxes } from '@/entity/components/HitBoxes';
import { Application, Container, Graphics } from 'pixi.js';
import type { GameMap } from '@/map/Map';
import type { PathingTo } from '@/entity/components/PathingTo';
import { hasPosition } from '@/entity/components/Position';
import type { BaseMap } from '@/map/BaseMap';
import { TILE_SIZE } from '@/MapManager';
import { type Maybe, none, some } from '@/utils/Maybe';
import { fibonacciHeap } from '@/ds/FibonacciHeap';

function getPath(history: Record<number, number>, target: number) {
  const path = [];
  let current = target;
  while (history[current] !== undefined) {
    path.unshift(current);
    current = history[current]!;
  }
  path.unshift(current);
  return path;
}

function aStar(map: BaseMap, from: number, to: number): Maybe<number[]> {
  const fib = fibonacciHeap<number>();
  fib.insertNode(0, from);

  const done = new Set<number>();

  const cameFrom: Record<number, number> = {};
  const tentativeCost: Record<number, number> = { [from]: 0 };

  while (fib.isNotEmpty()) {
    const current = fib.extractMin().unwrap();
    if (done.has(current)) continue;
    done.has(current);

    if (current === to) {
      return some(getPath(cameFrom, to));
    }

    for (const n of map.exits(current)) {
      const tentative = tentativeCost[current]! + map.distance(current, n);
      if (tentativeCost[n] === undefined || tentative < tentativeCost[n]!) {
        tentativeCost[n] = tentative;
        const estimate = tentativeCost[n]! + map.distance(n, to);
        cameFrom[n] = current;
        fib.insertNode(estimate, n);
      }
    }
  }

  return none();
}

export const PathingSystem: (
  app: Application
) => ECSSystem<[Position, HitBoxes, PathingTo]> = app => {
  const pathing = new Container();
  app.stage.addChild(pathing).zIndex = Number.MAX_VALUE;

  return {
    target: ['position', 'hitboxes', 'pathing_to'],
    run: (w, p, ents) => {
      pathing.removeChildren();
      const map = w.get<GameMap>('map').unwrap();
      ents.forEach(e => {
        w.getEntity(e.pathing_to.target).match(
          target => {
            if (hasPosition(target)) {
              const path = aStar(
                map,
                map.xyIndex(
                  Math.floor(e.position.x / TILE_SIZE),
                  Math.floor(e.position.y / TILE_SIZE)
                ),
                map.xyIndex(
                  Math.floor(target.position.x / TILE_SIZE),
                  Math.floor(target.position.y / TILE_SIZE)
                )
              );
              if (path.isSome()) {
                const g = new Graphics();
                const p = path.get();

                g.lineStyle(2, 0xffff00).moveTo(e.position.x, e.position.y);

                for (let next = 1; next < p.length; next++) {
                  const n = map.indexXy(p[next]!);
                  g.lineTo(
                    n[0] * TILE_SIZE + TILE_SIZE / 2,
                    n[1] * TILE_SIZE + TILE_SIZE / 2
                  );
                }
                pathing.addChild(g);
              }
            }
          },
          () => {
            w.removeComponent<PathingTo>(e, 'pathing_to');
          }
        );
      });
    }
  };
};
