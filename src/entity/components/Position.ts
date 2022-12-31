import type { ECSComponent } from '@/ecs/ECSComponent';
import type { Point } from '@/utils/types';
import { ecsComponent, has } from '@/ecs/ECSComponent';

export const PositionBrand = 'position';
type PositionBrand = typeof PositionBrand;
export type Position = ECSComponent<PositionBrand, Point>;

export const hasPosition = has<Position>('position');
export const positionComponent = (x: number, y: number) =>
  ecsComponent<Position>('position')({ x, y });

export const withPosition = (x: number, y: number) => () =>
  positionComponent(x, y);
