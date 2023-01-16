import type { PlayerStats } from '@/entity/components/Player';
import type { ProjectileStats } from '@/entity/components/Projectile';
import type { SpriteName } from '@/renderer/createAnimatedSprite';
import type { AsepriteSheet } from '@/utils/aseprite';
import type { ISpritesheetData } from 'pixi.js';
import type { ECSEmitter } from '@/createGameLoop';
import type { ECSWorld } from '@/ecs/ECSWorld';
import type { EnemyStats } from '@/entity/components/Enemy';

export type SpriteResource = {
  url: string;
  meta: ISpritesheetData;
  asepriteMeta: AsepriteSheet;
};

export type CodexPlayerClass = {
  baseStats: PlayerStats;
  spriteName: SpriteName;
};

export type CodexEnemy = {
  baseStats: EnemyStats;
  spriteName: SpriteName;
};

export type CodexProjectile = {
  baseStats: ProjectileStats;
  spriteName: SpriteName;
};

type ItemUseContext = {
  ecs: ECSWorld;
  emit: ECSEmitter;
};
export type CodexItem = {
  spriteName: SpriteName;
  onUse: (ctx: ItemUseContext) => void;
};
