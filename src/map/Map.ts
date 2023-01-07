import type { BaseMap } from '@/map/BaseMap';
import type { ECSEntityId } from '@/ecs/ECSEntity';
import type { Random } from '@/utils/rand/random';
import type { Rectangle } from '@/utils/types';
import { rectRectCollision } from '@/utils/collisions';

// should a map expose a "Room" struct?
// it could carry the rooms geometry information
// might be useful to spawn enemies things
export type TileType = 'WALL' | 'FLOOR' | 'STAIRS_DOWN' | 'ENTRY';
export type GameMap = BaseMap &
  Iterable<[number, number, TileType]> & {
    readonly width: number;
    readonly height: number;
    readonly level: number;

    entry(): [number, number];
    stairs(): [number, number];

    getEntities(x: number, y: number): ECSEntityId[];
    setEntities(x: number, y: number, entities: ECSEntityId[]): void;
    clearEntities(): void;

    isRevealed(x: number, y: number): boolean;
    setRevealed(x: number, y: number, isRevealed: boolean): void;
    clearRevealed(): void;

    isVisible(x: number, y: number): boolean;
    setVisible(x: number, y: number, isVisible: boolean): void;
    clearVisible(): void;

    isBlocked(x: number, y: number): boolean;
  };

const MIN_ROOM_SIZE = 3;

const MAX_ROOM_SIZE = 7;

const MAX_ROOM_ATTEMPTS = 10;

// prettier-ignore
const NEIGHBORS = [
  [-1, -1], [-1, 0], [-1, 1],
  [ 0, -1],          [ 0, 1],
  [ 1, -1], [ 1, 0], [ 1, 1],
] as [number, number][];

export function simpleMapGen(
  width: number,
  height: number,
  level: number,
  rooms: number,
  rng: Random
): GameMap {
  // setup internal states
  const tiles: TileType[] = new Array(width * height).fill('WALL');
  const revealedTiles: boolean[] = new Array(width * height).fill(false);
  const visibleTiles: boolean[] = new Array(width * height).fill(false);
  const blockedTiles: boolean[] = new Array(width * height).fill(false);
  const tileContent: ECSEntityId[][] = new Array(width * height)
    .fill(null)
    .map(() => []);
  const xyIndex = (x: number, y: number) => width * y + x;
  const indexXy = (idx: number): [number, number] => [
    idx % width,
    Math.floor(idx / width)
  ];

  // generate room layouts
  const roomsList = new Array<Rectangle>();
  for (let room = 0; room < rooms; room++) {
    for (let attempt = 0; attempt < MAX_ROOM_ATTEMPTS; attempt++) {
      const x = rng.nextRange(1, width - MIN_ROOM_SIZE - 2);
      const y = rng.nextRange(1, height - MIN_ROOM_SIZE - 2);
      const w = rng.nextRange(
        MIN_ROOM_SIZE,
        Math.min(width - x, MAX_ROOM_SIZE)
      );
      const h = rng.nextRange(
        MIN_ROOM_SIZE,
        Math.min(height - x, MAX_ROOM_SIZE)
      );
      const nextRoom = { x, y, w, h };

      let isValid = true;
      for (const other of roomsList) {
        if (
          rectRectCollision({ x: x - 1, y: y - 1, w: w + 1, h: h + 1 }, other) // prevent room merging (ish)
        ) {
          isValid = false;
        }
      }

      if (isValid) {
        roomsList.push(nextRoom);
        break;
      }
    }
  }

  // carve rooms
  for (const { x, y, w, h } of roomsList) {
    for (let j = y; j < y + h; j++) {
      for (let i = x; i < x + w; i++) {
        tiles[xyIndex(i, j)] = 'FLOOR';
      }
    }
  }

  // connect rooms
  let prev = 0;
  for (let next = 1; next < roomsList.length; prev++, next++) {
    const room1 = roomsList[prev]!;
    const room2 = roomsList[next]!;
    const x1 = room1.x + Math.floor(room1.w / 2);
    const y1 = room1.y + Math.floor(room1.h / 2);
    const x2 = room2.x + Math.floor(room2.w / 2);
    const y2 = room2.y + Math.floor(room2.h / 2);

    if (rng.nextF() < 0.5) {
      // from x1 to x2 on y1
      for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
        tiles[xyIndex(x, y1)] = 'FLOOR';
      }
      // from y1 to y2 on x2
      for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
        tiles[xyIndex(x2, y)] = 'FLOOR';
      }
    } else {
      // from x1 to x2 on y2
      for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
        tiles[xyIndex(x, y2)] = 'FLOOR';
      }
      // from y1 to y2 on x1
      for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
        tiles[xyIndex(x1, y)] = 'FLOOR';
      }
    }
  }

  // place entry
  const entry = roomsList[0]!;
  const entryPos = [0, 0];
  let success = false;
  do {
    const x = rng.nextRange(entry.x, entry.x + entry.w - 1);
    const y = rng.nextRange(entry.y, entry.y + entry.h - 1);
    const idx = xyIndex(x, y);
    if (tiles[idx] === 'FLOOR') {
      success = true;
      entryPos[0] = x;
      entryPos[1] = y;
      tiles[idx] = 'ENTRY';
    }
  } while (!success);

  // place exit
  const exit = roomsList[roomsList.length - 1]!;
  const exitPos = [0, 0];
  success = false;
  do {
    const x = rng.nextRange(exit.x, exit.x + exit.w - 1);
    const y = rng.nextRange(exit.y, exit.y + exit.h - 1);
    const idx = xyIndex(x, y);
    if (tiles[idx] === 'FLOOR') {
      success = true;
      exitPos[0] = x;
      exitPos[1] = y;
      tiles[idx] = 'STAIRS_DOWN';
    }
  } while (!success);

  // todo: place monsters and other entities

  return {
    width,
    height,
    level,
    entry(): [number, number] {
      return [...entryPos] as [number, number];
    },
    stairs(): [number, number] {
      return [...exitPos] as [number, number];
    },
    isVisible(x: number, y: number): boolean {
      return visibleTiles[xyIndex(x, y)]!;
    },
    setVisible(x: number, y: number, isVisible: boolean): void {
      visibleTiles[xyIndex(x, y)] = isVisible;
    },
    clearVisible() {
      for (let i = 0; i < tiles.length; i++) {
        visibleTiles[i] = false;
      }
    },
    isRevealed(x: number, y: number): boolean {
      return revealedTiles[xyIndex(x, y)]!;
    },
    setRevealed(x: number, y: number, isRevealed: boolean): void {
      revealedTiles[xyIndex(x, y)] = isRevealed;
    },
    clearRevealed() {
      for (let i = 0; i < tiles.length; i++) {
        revealedTiles[i] = false;
      }
    },
    isBlocked(x: number, y: number): boolean {
      const idx = xyIndex(x, y);
      return tiles[idx] === 'WALL' || blockedTiles[idx]!;
    },
    getEntities(x: number, y: number): ECSEntityId[] {
      return tileContent[xyIndex(x, y)]!;
    },
    setEntities(x: number, y: number, entities: ECSEntityId[]) {
      tileContent[xyIndex(x, y)] = entities;
    },
    clearEntities() {
      for (let i = 0; i < tiles.length; i++) {
        tileContent[i] = [];
      }
    },
    distance(idx1: number, idx2: number): number {
      const [x1, y1] = indexXy(idx1);
      const [x2, y2] = indexXy(idx2);
      return Math.hypot(x2 - x1, y2 - y1);
    },
    exits(idx: number): number[] {
      const [x, y] = indexXy(idx);
      return NEIGHBORS.map(([dx, dy]) => [x + dx, y + dy] as [number, number])
        .filter(([nx, ny]) => ny > 0 && nx > 0 && ny < height && nx < width)
        .map(([nx, ny]) => xyIndex(nx, ny));
    },
    isOpaque(idx: number): boolean {
      return tiles[idx] === 'WALL';
    },
    *[Symbol.iterator]() {
      for (let x = 0; x < width; x++) {
        for (let y = 0; y < width; y++) {
          yield [x, y, tiles[xyIndex(x, y)]!];
        }
      }
    }
  };
}
