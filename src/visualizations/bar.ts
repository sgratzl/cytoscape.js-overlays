import { IAttrAccessor, IScale, IVisualization } from './interfaces';
import { resolveAccessor, resolveScale } from './utils';

export interface IBarOptions {
  scale: IScale;
  backgroundColor: string;
  borderColor: string;
}

/**
 * @internal
 */
export const defaultBarOptions: IBarOptions = {
  scale: [0, 1],
  backgroundColor: '#cccccc',
  borderColor: '#a0a0a0',
};

export function renderBar(attr: IAttrAccessor<number>, options: Partial<IBarOptions> = {}): IVisualization {
  const o = Object.assign({}, defaultBarOptions, options);
  const acc = resolveAccessor(attr);
  const scale = resolveScale(o.scale);

  const r: IVisualization = (ctx, node, dim) => {
    const value = acc(node);

    if (value != null && !Number.isNaN(value)) {
      ctx.fillStyle = o.backgroundColor;
      const v = scale(value);
      ctx.fillRect(0, 0, dim.width * v, dim.height);
    }

    if (o.borderColor) {
      ctx.strokeStyle = o.borderColor;
      ctx.strokeRect(0, 0, dim.width, dim.height);
    }
  };
  r.defaultHeight = 5;
  r.defaultPosition = 'below';
  return r;
}
