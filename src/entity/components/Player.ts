import type { ECSComponent } from '@/ecs/ECSComponent';
import { ecsComponent, has } from '@/ecs/ECSComponent';
import type { Stats } from '@/utils/types';

export type PlayerStats = {
  speed: number;
  health: number;
};

export const PlayerBrand = 'player';
type PlayerBrand = typeof PlayerBrand;
export type Player = ECSComponent<PlayerBrand, { stats: Stats<PlayerStats> }>;
export const playerComponent = ecsComponent<Player>('player');
export const hasPlayer = has<Player>('player');
