import { IAttrAccessor, IVisualization } from './interfaces';
import { resolveAccessor } from './utils';
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
  backgroundColor: string;
  borderColor: string;
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

  const r: IVisualization = (ctx, node, dim) => {
    const value = acc(node);

    if (value == null || !Array.isArray(value)) {
      return;
    }
    const hist = generateHist(value, o);

    ctx.fillStyle = o.backgroundColor;
    ctx.strokeStyle = o.borderColor;

    const binWidth = (dim.width - (hist.length - 1) * o.barPadding) / hist.length;
    const maxBin = hist.reduce((acc, v) => Math.max(acc, v), 0);
    const yScale = (v: number) => (v / maxBin) * dim.height;

    let offset = 0;
    for (const bin of hist) {
      const y = yScale(bin);
      ctx.fillRect(offset, y, binWidth, dim.height - y);
      offset += binWidth + o.barPadding;
    }

    ctx.strokeRect(0, 0, dim.width, dim.height);
  };
  r.defaultHeight = 20;
  r.defaultPosition = 'below';
  return r;
}
