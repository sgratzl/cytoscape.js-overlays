import type { IAttrAccessor, IVisualization, IDimension, INodeFunction } from './interfaces';
import { resolveAccessor, resolveScale, resolveFunction, autoResolveScale } from './utils';
import { type IBoxPlot, boxplot, type BoxplotStatsOptions } from '@sgratzl/boxplots';
import { type IBarOptions, defaultColorOptions } from './bar';
import type cy from 'cytoscape';
import seedrandom from 'seedrandom';

export interface IBoxplotOptions extends BoxplotStatsOptions, IBarOptions {
  /**
   * pixel radius when rendering outliers
   * @default 2
   */
  outlierRadius: number;
  /**
   * color for rendering outliers
   */
  outlierBackgroundColor: INodeFunction<string>;
  /**
   * pixel radius when rendering items
   * @default 0
   */
  itemRadius: number;
  /**
   * color for rendering items
   */
  itemBackgroundColor: INodeFunction<string>;

  /**
   * padding for a smaller boxplot box
   * @default 1
   */
  boxPadding: number;
}

const defaultOptions: IBoxplotOptions = {
  scale: [0, Number.NaN],
  ...defaultColorOptions,

  outlierRadius: 2,
  get outlierBackgroundColor() {
    return this.backgroundColor;
  },
  itemRadius: 0,
  get itemBackgroundColor() {
    return this.backgroundColor;
  },

  boxPadding: 1,
};

function renderPoints(
  ctx: CanvasRenderingContext2D,
  points: Iterable<number>,
  radius: number,
  x: (v: number) => number,
  y: (v: number) => number
) {
  for (const p of points) {
    const px = x(p);
    const py = y(p);
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function renderBoxplot(
  attr: IAttrAccessor<readonly number[] | IBoxPlot>,
  options: Partial<IBoxplotOptions> = {}
): IVisualization {
  const o = Object.assign({}, defaultOptions, options);
  const acc = resolveAccessor(attr);
  let scale01 = resolveScale(o.scale);

  const r: IVisualization = (ctx, node, dim) => {
    const value = acc(node);

    if (value == null) {
      return;
    }

    const b = Array.isArray(value) ? boxplot(value, o) : (value as IBoxPlot);

    const scale = (v: number) => scale01(v) * dim.width;

    if (b == null || Number.isNaN(b.max)) {
      return;
    }

    renderBoxplotImpl(ctx, node, o, scale, b, dim);
  };
  r.init = (nodes) => {
    scale01 = autoResolveScale(o.scale, () =>
      nodes
        .map((n) => {
          const b = acc(n);
          if (Array.isArray(b)) {
            return b;
          }
          return [(b as IBoxPlot).min, (b as IBoxPlot).max];
        })
        .flat()
    );
  };
  r.defaultHeight = 10;
  r.defaultPosition = 'bottom';
  return r;
}

function renderBoxplotImpl(
  ctx: CanvasRenderingContext2D,
  node: cy.NodeSingular,
  o: IBoxplotOptions,
  scale: (v: number) => number,
  b: IBoxPlot,
  dim: IDimension
) {
  if (o.itemRadius > 0 && b.items.length > 0) {
    const rnd = seedrandom(node.id());
    ctx.fillStyle = resolveFunction(o.itemBackgroundColor)(node);
    const yDim = dim.height - o.itemRadius * 2;
    renderPoints(
      ctx,
      Array.from(b.items),
      o.itemRadius,
      (v) => scale(v),
      () => o.itemRadius + rnd() * yDim
    );
  }

  ctx.strokeStyle = resolveFunction(o.borderColor)(node);
  ctx.fillStyle = resolveFunction(o.backgroundColor)(node);

  // draw box
  const q1 = scale(b.q1);
  const q3 = scale(b.q3);
  const boxHeight = dim.height - 2 * o.boxPadding;
  ctx.fillRect(q1, o.boxPadding, q3 - q1, boxHeight);

  // draw median line
  ctx.beginPath();
  const median = scale(b.median);
  const whiskerLow = scale(b.whiskerLow);
  const whiskerHigh = scale(b.whiskerHigh);

  // whisker line
  ctx.moveTo(whiskerLow, 0);
  ctx.lineTo(whiskerLow, dim.height);
  ctx.moveTo(whiskerHigh, 0);
  ctx.lineTo(whiskerHigh, dim.height);
  ctx.moveTo(whiskerLow, dim.height / 2);
  ctx.lineTo(q1, dim.height / 2);
  ctx.moveTo(whiskerHigh, dim.height / 2);
  ctx.lineTo(q3, dim.height / 2);

  // box stroke
  ctx.rect(q1, o.boxPadding, q3 - q1, boxHeight);

  // draw median line
  ctx.moveTo(median, o.boxPadding);
  ctx.lineTo(median, dim.height - o.boxPadding);

  ctx.stroke();

  if (o.outlierRadius > 0 && b.outlier.length > 0) {
    ctx.fillStyle = resolveFunction(o.outlierBackgroundColor)(node);
    renderPoints(
      ctx,
      b.outlier,
      o.outlierRadius,
      (v) => scale(v),
      () => dim.height / 2
    );
  }
}
