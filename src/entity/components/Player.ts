import type { ECSComponent } from '@/ecs/ECSComponent';
import { ecsComponent, has } from '@/ecs/ECSComponent';

export const PlayerBrand = 'player';
type PlayerBrand = typeof PlayerBrand;
export type Player = ECSComponent<PlayerBrand, { level: number }>;
export const playerComponent = ecsComponent<Player>('player');
export const hasPlayer = has<Player>('player');
