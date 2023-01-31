import type { ECSEntity } from '@/ecs/ECSEntity';
import type { Renderable } from '@/entity/components/Renderable';
import { resolveRenderable } from '@/renderer/renderableManager';
import { AnimatedSprite, Application, Text } from 'pixi.js';
import { Bezier } from 'bezier-js';
import { lerp, randomInRange } from '@/utils/math';
import {
  InCircle,
  InCubic,
  InOctic,
  InOutBounce,
  OutCubic,
  OutOctic,
  OutQuartic
} from '@/utils/easing';

export const damageNumberFx = (
  entity: ECSEntity & Renderable,
  amount: number,
  app: Application
) => {
  const sprite = resolveRenderable<AnimatedSprite>(entity.entity_id);
  const text = new Text(amount, {
    fontFamily: 'Inconsolata',
    fontSize: 26,
    fill: 0xffff00,
    stroke: 0xffffff,
    strokeThickness: 2,
    align: 'center'
  });
  text.scale.set(0.5, 0.5);
  text.position.set(sprite.position.x, sprite.position.y);

  let targetX = randomInRange(-80, 80);
  targetX = targetX < 0 ? Math.min(-50, targetX) : Math.max(50, targetX);
  const curve = new Bezier(
    {
      x: sprite.position.x,
      y: sprite.position.y
    },
    {
      x: sprite.position.x,
      y: sprite.position.y - sprite.height * 2
    },
    {
      x: sprite.position.x + targetX,
      y: sprite.position.y - sprite.height / 2
    }
  );

  const DURATION = 800;
  let elapsed = 0;

  const update = () => {
    elapsed += app.ticker.deltaMS;
    const percentage = elapsed / DURATION;

    if (percentage >= 1) {
      text.destroy();
      app.ticker.remove(update);
      return;
    }

    const { x, y } = curve.get(lerp(0, 1, percentage, OutQuartic));
    text.alpha = percentage > 0.3 ? 1 - lerp(0, 1, percentage, OutCubic) : 1;
    text.style.fontSize = lerp(10, 40, percentage, OutQuartic);
    text.position.set(x, y);
  };

  app.ticker.add(update);

  sprite.parent.addChild(text);
};
