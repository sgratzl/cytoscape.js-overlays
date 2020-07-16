import { IAttrAccessor, IScale, IVisualization } from './interfaces';
import { resolveAccessor, resolveScale } from './utils';
import { IBoxPlot, boxplot, BoxplotStatsOptions } from '@sgratzl/boxplots';
// import seedrandom from 'seedrandom';

export interface IBoxplotOptions extends BoxplotStatsOptions {
  scale: IScale;
  backgroundColor: string;
  borderColor: string;

  outlierRadius: number;
  outlierBackgroundColor: string;
  itemRadius: number;
  itemBackgroundColor: string;

  boxPadding: number;
}

const defaultOptions: IBoxplotOptions = {
  scale: [0, 1],
  backgroundColor: 'green',
  borderColor: 'black',

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
  ctx.beginPath();
  for (const p of points) {
    const px = x(p);
    const py = y(p);
    ctx.arc(px, py, radius, 0, Math.PI * 2);
  }
  ctx.fill();
}

export function renderBoxplot(
  attr: IAttrAccessor<readonly number[] | IBoxPlot>,
  options: Partial<IBoxplotOptions> = {}
): IVisualization {
  const o = Object.assign({}, defaultOptions, options);
  const acc = resolveAccessor(attr);
  const scale01 = resolveScale(o.scale);

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

    // if (o.itemRadius > 0 && b.items.length > 0) {
    //   const rnd = seedrandom(node.id());
    //   ctx.fillStyle = o.itemBackgroundColor;
    //   const yDim = dim.height - o.itemRadius * 2;
    //   renderPoints(
    //     ctx,
    //     b.outlier,
    //     o.outlierRadius,
    //     (v) => scale(v),
    //     () => rnd() * yDim
    //   );
    // }

    ctx.strokeStyle = o.borderColor;
    ctx.fillStyle = o.backgroundColor;

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
      ctx.fillStyle = o.outlierBackgroundColor;
      renderPoints(
        ctx,
        b.outlier,
        o.outlierRadius,
        (v) => scale(v),
        () => dim.height / 2
      );
    }
  };
  r.defaultHeight = 10;
  r.defaultPosition = 'below';
  return r;
}
