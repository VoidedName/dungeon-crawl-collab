import { getEntityById } from './EntityManager';
import { updatePlayer, type TPlayerEntity } from './PlayerEntity';

export function createGameLoop() {
  function tick() {
    const player = getEntityById('player')! as unknown as TPlayerEntity;

    updatePlayer(player);

    window.requestAnimationFrame(tick);
  }
  window.requestAnimationFrame(tick);
}
