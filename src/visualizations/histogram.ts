import { IAttrAccessor, IVisualization, INodeFunction } from './interfaces';
import { resolveAccessor, resolveFunction } from './utils';
import { defaultColorOptions } from './bar';
import { histogram } from 'd3-array';

export interface IHist {
  bins: readonly number[];
}

function isHist(value: readonly number[] | IHist): value is IHist {
  return Array.isArray((value as IHist).bins);
}
export interface IHistogramOptions {
  scale: [number, number];
  backgroundColor: INodeFunction<string>;
  borderColor: INodeFunction<string>;
  barPadding: number;
}

function generateHist(value: readonly number[] | IHist, options: Partial<IHistogramOptions>): readonly number[] {
  if (isHist(value)) {
    return value.bins;
  }
  const b = histogram<number, number>();
  if (options.scale) {
    b.domain(options.scale);
  }
  return b(value).map((d) => d.length);
}

export function renderHistogram(
  attr: IAttrAccessor<readonly number[] | IHist>,
  options: Partial<IHistogramOptions> = {}
): IVisualization {
  const o = Object.assign(
    {
      barPadding: 0,
    },
    defaultColorOptions,
    options
  );
  const acc = resolveAccessor(attr);
  const backgroundColor = resolveFunction(o.backgroundColor);
  const borderColor = resolveFunction(o.borderColor);

  const r: IVisualization = (ctx, node, dim) => {
    const value = acc(node);
    ctx.strokeStyle = borderColor(node);
    ctx.strokeRect(0, 0, dim.width, dim.height);

    if (value == null || !Array.isArray(value)) {
      return;
    }
    const hist = generateHist(value, o);

    ctx.fillStyle = backgroundColor(node);

    const binWidth = (dim.width - (hist.length - 1) * o.barPadding) / hist.length;
    const maxBin = hist.reduce((acc, v) => Math.max(acc, v), 0);
    const yScale = (v: number) => (v / maxBin) * dim.height;

    let offset = 0;
    for (const bin of hist) {
      const height = yScale(bin);
      ctx.fillRect(offset, dim.height - height, binWidth, height);
      offset += binWidth + o.barPadding;
    }
  };
  r.defaultHeight = 20;
  r.defaultPosition = 'bottom';
  return r;
}
