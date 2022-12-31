import type { BrandFromComponent, ECSComponentPros } from '@/ecs/types';
import type { ECSEntity } from '@/ecs/ECSEntity';

/**
 * A component represents a "property" of some sort that an entity can possess.
 *
 * An example is "Position". An entity could be positioned somewhere on the map.
 *
 * Some helper functions exist for pipe chaining various components
 *
 * @example
 * let e = addComponent(createEntity(), positionComponent(2, 4))
 *
 * e.position.x // 2
 * e.position.y // 4
 *
 * hasPosition(e) // true
 *
 * e = removeComponent(e, 'position')
 * hasPosition(e) // false
 *
 * // adds player and position components to e
 * e = pipe(withPlayer())
 *        .then(withPosition(2, 4))
 *        .evaluate(e)
 */
export type ECSComponent<T extends string, Props extends object = object> = {
  [key in T]: Props;
};

/**
 * Generates a TypeGuard for a specific component
 *
 * @example
 *
 * const hasPlayer = has<Position>("position");
 *
 * if (hasPlayer(e)) {
 *    e.position // do something with position
 * }
 */

export const has =
  <C extends ECSComponent<any>>(brand: BrandFromComponent<C>) =>
  <E extends ECSEntity = ECSEntity>(e: E): e is E & C =>
    brand in e;

export const ecsComponent =
  <C extends ECSComponent<any>>(brand: BrandFromComponent<C>) =>
  (props: ECSComponentPros<C>) =>
    ({
      [brand]: props
    } as unknown as C);
