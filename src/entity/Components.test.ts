import { describe, expect, test } from 'vitest';
import { createEntity } from '@/entity/Entity';
import {
  addComponent,
  hasPlayer,
  hasPosition,
  hasRenderable,
  playerComponent,
  positionComponent,
  removeComponent,
  renderableComponent,
  withPlayer,
  withPosition,
  withRenderable
} from '@/entity/Components';

describe('player component', () => {
  test('has player is false when not tagged', () => {
    const e = createEntity();
    expect(hasPlayer(e)).toBeFalsy();
  });

  test('has player is true when tagged', () => {
    const e = addComponent(createEntity(), () => playerComponent());
    expect(hasPlayer(e)).toBeTruthy();
  });

  test('has player when is tagged through the with method', () => {
    const e = withPlayer()(createEntity());
    expect(hasPlayer(e)).toBeTruthy();
  });

  test('has player is false when component was removed', () => {
    const e = removeComponent(withPlayer()(createEntity()), 'player');
    expect(hasPlayer(e)).toBeFalsy();
  });
});

describe('renderable component', () => {
  test('has renderable is false when not tagged', () => {
    const e = createEntity();
    expect(hasRenderable(e)).toBeFalsy();
  });

  test('has renderable is true when tagged', () => {
    const e = addComponent(createEntity(), () => renderableComponent(99));
    expect(hasRenderable(e)).toBeTruthy();
  });

  test('has renderable has the right sprite id', () => {
    const e = addComponent(createEntity(), () => renderableComponent(99));
    expect(e.renderable.sprite).toBe(99);
  });

  test('has renderable when is tagged through the with method', () => {
    const e = withRenderable(66)(createEntity());
    expect(hasRenderable(e)).toBeTruthy();
  });

  test('has renderable is false when component was removed', () => {
    const e = removeComponent(withRenderable(53)(createEntity()), 'renderable');
    expect(hasRenderable(e)).toBeFalsy();
  });
});

describe('position component', () => {
  test('has position is false when not tagged', () => {
    const e = createEntity();
    expect(hasPosition(e)).toBeFalsy();
  });

  test('has position is true when tagged', () => {
    const e = addComponent(createEntity(), () => positionComponent(5, 99));
    expect(hasPosition(e)).toBeTruthy();
  });

  test('has position has the right coords', () => {
    const e = addComponent(createEntity(), () => positionComponent(13, 7));
    expect(e.position.x).toBe(13);
    expect(e.position.y).toBe(7);
  });

  test('has position when is tagged through the with method', () => {
    const e = withPosition(66, 6)(createEntity());
    expect(hasPosition(e)).toBeTruthy();
  });

  test('has position is false when component was removed', () => {
    const e = removeComponent(withPosition(25, 25)(createEntity()), 'position');
    expect(hasPosition(e)).toBeFalsy();
  });
});
