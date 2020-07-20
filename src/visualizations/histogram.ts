import { histogram } from 'd3-array';
import { defaultColorOptions } from './bar';
import { IAttrAccessor, INodeFunction, IVisualization } from './interfaces';
import { resolveAccessor, resolveFunction } from './utils';

export interface IHist {
  bins: readonly number[];
}

function isHist(value: readonly number[] | IHist): value is IHist {
  return Array.isArray((value as IHist).bins);
}
export interface IHistogramOptions {
  scale: [number, number];
  maxBin: number;
  backgroundColor: INodeFunction<string>;
  borderColor: INodeFunction<string>;
  barPadding: number;
}

function generateHist(value: readonly number[] | IHist, scale: [number, number]): readonly number[] {
  if (isHist(value)) {
    return value.bins;
  }
  const b = histogram<number, number>();
  b.domain(scale);
  return b(value).map((d) => d.length);
}

export function renderHistogram(
  attr: IAttrAccessor<readonly number[] | IHist>,
  options: Partial<IHistogramOptions> = {}
): IVisualization {
  const o = Object.assign(
    {
      scale: [Number.NaN, Number.NaN] as [number, number],
      maxBin: Number.NaN,
      barPadding: 0,
    },
    defaultColorOptions,
    options
  );
  const acc = resolveAccessor(attr);
  let maxBin = o.maxBin;
  let scale = o.scale;
  const backgroundColor = resolveFunction(o.backgroundColor);
  const borderColor = resolveFunction(o.borderColor);

  const r: IVisualization = (ctx, node, dim) => {
    const value = acc(node);
    ctx.strokeStyle = borderColor(node);
    ctx.strokeRect(0, 0, dim.width, dim.height);

    if (value == null || !Array.isArray(value)) {
      return;
    }
    const hist = generateHist(value, scale);

    ctx.fillStyle = backgroundColor(node);

    const binWidth = (dim.width - (hist.length - 1) * o.barPadding) / hist.length;
    const yScale = (v: number) => (v / maxBin) * dim.height;

    let offset = 0;
    for (const bin of hist) {
      const height = yScale(bin);
      ctx.fillRect(offset, dim.height - height, binWidth, height);
      offset += binWidth + o.barPadding;
    }
  };
  r.init = (nodes) => {
    if (!Number.isNaN(maxBin) && !Number.isNaN(scale[0]) && !Number.isNaN(scale[1])) {
      return;
    }

    // derive hist borders
    const r = nodes.reduce(
      (r, node) => {
        const v = acc(node);
        if (v == null || !Array.isArray(v)) {
          return r;
        }
        if (isHist(v)) {
          r.maxBin = v.reduce((m, b) => Math.max(m, b), r.maxBin);
          return r;
        }

        const b = histogram<number, number>();
        const hist = b(v);
        r.maxBin = hist.reduce((m, b) => Math.max(m, b.length), r.maxBin);
        if (hist.length > 0) {
          r.min = Math.min(r.min, hist[0]!.x0!);
          r.max = Math.max(r.max, hist[hist.length - 1]!.x1!);
        }
        return r;
      },
      {
        min: Number.POSITIVE_INFINITY,
        max: Number.NEGATIVE_INFINITY,
        maxBin: 0,
      }
    );
    if (Number.isNaN(maxBin)) {
      maxBin = r.maxBin;
    }
    scale = [Number.isNaN(scale[0]) ? r.min : scale[0], Number.isNaN(scale[1]) ? r.max : scale[0]];
  };
  r.defaultHeight = 20;
  r.defaultPosition = 'bottom';
  return r;
}
