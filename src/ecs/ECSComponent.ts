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
// NO, ESLint, you are wrong. Object and {} do not mean the same thing,
// and your suggested variants are not type compatible.
// eslint-disable-next-line @typescript-eslint/ban-types
export type ECSComponent<T extends string, Props extends {} = {}> = {
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

type ECSBuilder<C extends ECSComponent<any>> =
  ECSComponentPros<C> extends Record<string, never>
    ? () => C
    : (props: ECSComponentPros<C>) => () => C;

/**
 * Generates a ECSComponent constructor for a specific component
 *
 * @example
 *
 * const position = ecsComponent<Position>("position");
 *
 * const positionComponent = position({x: 4, y: 5})
 */
export const ecsComponent = <C extends ECSComponent<any>>(
  brand: BrandFromComponent<C>
): ECSBuilder<C> =>
  ((props?: ECSComponentPros<C>) => {
    if (props === undefined) return { [brand]: {} };
    return () => ({ [brand]: props });
  }) as ECSBuilder<C>;
