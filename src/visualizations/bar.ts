import cy from 'cytoscape';
import { IVisualization, IAttrAccessor, IScale } from './interfaces';
import { scaleLinear } from 'd3-scale';
import { resolveScale, resolveAccessor } from './utils';

export interface IBarOptions {
  scale: IScale;
  fillColor: string;
  strokeColor: string;
  height: number;
}

const defaultOptions: IBarOptions = {
  scale: [0, 1],
  fillColor: 'green',
  strokeColor: 'black',
  height: 5,
};

export function renderBar(attr: IAttrAccessor, options: Partial<IBarOptions> = {}): IVisualization {
  const o = Object.assign({}, defaultOptions, options);
  const acc = resolveAccessor(attr);
  const scale = resolveScale(o.scale);

  return (ctx, node, y, width) => {
    const value = acc(node);

    if (value != null && !Number.isNaN(value)) {
      ctx.fillStyle = o.fillColor;
      const v = scale(value);
      ctx.fillRect(0, y, width * v, o.height);
    }

    if (o.strokeColor) {
      ctx.strokeStyle = o.strokeColor;
      ctx.strokeRect(0, y, width, o.height);
    }
    return o.height;
  };
}
