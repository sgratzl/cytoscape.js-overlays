import { IAttrAccessor, IScale, IVisualization, INodeFunction } from './interfaces';
import { resolveAccessor, resolveScale, resolveFunction } from './utils';

export interface IBarOptions {
  scale: IScale;
  backgroundColor: INodeFunction<string>;
  borderColor: INodeFunction<string>;
}

/**
 * @internal
 */
export const defaultColorOptions = {
  backgroundColor: '#cccccc',
  borderColor: '#a0a0a0',
};

export function renderBar(attr: IAttrAccessor<number>, options: Partial<IBarOptions> = {}): IVisualization {
  const o = Object.assign(
    {
      scale: [0, 1],
    },
    defaultColorOptions,
    options
  );
  const acc = resolveAccessor(attr);
  const scale = resolveScale(o.scale);
  const backgroundColor = resolveFunction(o.backgroundColor);
  const borderColor = resolveFunction(o.borderColor);

  const r: IVisualization = (ctx, node, dim) => {
    const value = acc(node);

    if (value != null && !Number.isNaN(value)) {
      ctx.fillStyle = backgroundColor(node);
      const v = scale(value);
      ctx.fillRect(0, 0, dim.width * v, dim.height);
    }

    const b = borderColor(node);
    if (b) {
      ctx.strokeStyle = b;
      ctx.strokeRect(0, 0, dim.width, dim.height);
    }
  };
  r.defaultHeight = 5;
  r.defaultPosition = 'below';
  return r;
}
