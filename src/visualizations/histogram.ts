import { histogram } from 'd3-array';
import { defaultColorOptions } from './bar';
import type { IAttrAccessor, INodeFunction, IVisualization } from './interfaces';
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

  const viz: IVisualization = (ctx, node, dim) => {
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
  viz.init = (nodes) => {
    if (!Number.isNaN(maxBin) && !Number.isNaN(scale[0]) && !Number.isNaN(scale[1])) {
      return;
    }

    // derive hist borders
    const output = nodes.reduce(
      (out, node) => {
        const v = acc(node);
        if (v == null || !Array.isArray(v)) {
          return out;
        }
        if (isHist(v)) {
          out.maxBin = v.reduce((m, b) => Math.max(m, b), out.maxBin);
          return out;
        }

        const b = histogram<number, number>();
        const hist = b(v);
        out.maxBin = hist.reduce((m, bin) => Math.max(m, bin.length), out.maxBin);
        if (hist.length > 0) {
          out.min = Math.min(out.min, hist[0]!.x0!);
          out.max = Math.max(out.max, hist[hist.length - 1]!.x1!);
        }
        return out;
      },
      {
        min: Number.POSITIVE_INFINITY,
        max: Number.NEGATIVE_INFINITY,
        maxBin: 0,
      }
    );
    if (Number.isNaN(maxBin)) {
      maxBin = output.maxBin;
    }
    scale = [Number.isNaN(scale[0]) ? output.min : scale[0], Number.isNaN(scale[1]) ? output.max : scale[0]];
  };
  viz.defaultHeight = 20;
  viz.defaultPosition = 'bottom';
  return viz;
}
