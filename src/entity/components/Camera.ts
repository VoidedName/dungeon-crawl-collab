import type { ECSComponent } from '@/ecs/ECSComponent';
import type { Nullable, Point } from '@/utils/types';
import { ecsComponent, has } from '@/ecs/ECSComponent';
import type { ECSEntityId } from '@/ecs/ECSEntity';

type CameraProps = {
  offset: Point;
  following: Nullable<ECSEntityId>;
};

export const CameraBrand = 'camera';
type CameraBrand = typeof CameraBrand;
export type Camera = ECSComponent<CameraBrand, CameraProps>;

export const hasPosition = has<Camera>(CameraBrand);
export const cameraComponent = ecsComponent<Camera>(CameraBrand);
