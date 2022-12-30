import type { TEntity } from './EntityManager';

export const PLAYER_SPEED = 1;

export enum Direction {
  up,
  down,
  left,
  right
}

export type TPlayerEntity = {
  speed: number;
  sprite: any;
} & TEntity;

export function movePlayer(player: TPlayerEntity, direction: Direction) {
  switch (direction) {
    case Direction.right:
      player.sprite.position.set(
        player.sprite.position.x + player.speed,
        player.sprite.position.y
      );
      break;
    case Direction.left:
      player.sprite.position.set(
        player.sprite.position.x - player.speed,
        player.sprite.position.y
      );
      break;
    case Direction.up:
      player.sprite.position.set(
        player.sprite.position.x,
        player.sprite.position.y - player.speed
      );
      break;
    case Direction.down:
      player.sprite.position.set(
        player.sprite.position.x,
        player.sprite.position.y + player.speed
      );
      break;
  }
}
