import type { ECSComponent } from '@/ecs/ECSComponent';
import type { ECSEntity } from '@/ecs/ECSEntity';

export const MapObjectBrand = 'mapObject';
type MapObjectBrand = typeof MapObjectBrand;
export type MapObject = ECSComponent<MapObjectBrand>;

export function hasMapObject<E extends ECSEntity>(e: E): e is E & MapObject {
  return MapObjectBrand in e;
}

export function mapObjectComponent(): MapObject {
  return {
    [MapObjectBrand]: {}
  };
}

export const withMapObject = () => () => mapObjectComponent();
