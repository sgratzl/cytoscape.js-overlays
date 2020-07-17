import { IAttrAccessor, IVisualization, IScale, INodeFunction } from './interfaces';
import { resolveAccessor, resolveScale, resolveFunction } from './utils';
import { defaultColorOptions } from './bar';
import { renderLine, renderArea } from './lineUtils';

export interface IBinarySparkLineOptions {
  scale: IScale;
  centerValue: number;
  aboveBackgroundColor: INodeFunction<string>;
  belowBackgroundColor: INodeFunction<string>;
  aboveLineColor: INodeFunction<string>;
  belowLineColor: INodeFunction<string>;
  centerValueColor: INodeFunction<string>;
  borderColor: INodeFunction<string>;
  padding: number;
}

function lineSplit(x1: number, y1: number, x2: number, y2: number, centerValue: number) {
  const m = (y1 - y2) / (x1 - x2);
  // y − y1 = m(x − x1)
  // x = (y - y1) / m + x1;
  return (centerValue - y1) / m + x1;
}

function splitSegments(values: readonly number[], centerValue: number) {
  const above: { x: number; y: number }[] = [];
  const below: { x: number; y: number }[] = [];

  let previousIndex: number | null = null;
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (v == null || Number.isNaN(v)) {
      previousIndex = null;
      if (above.length > 0 && !Number.isNaN(above[above.length - 1].y)) {
        above.push({ x: i, y: Number.NaN });
      }
      if (below.length > 0 && !Number.isNaN(below[below.length - 1].y)) {
        below.push({ x: i, y: Number.NaN });
      }
      continue;
    }

    if (previousIndex != null && values[previousIndex] < centerValue !== v < centerValue) {
      // crossed the line
      const xc = lineSplit(previousIndex, values[previousIndex], i, v, centerValue);
      above.push({ x: xc, y: centerValue });
      below.push({ x: xc, y: centerValue });
    }

    if (v < centerValue) {
      above.push({ x: i, y: v });
    } else {
      below.push({ x: i, y: v });
    }

    previousIndex = i;
  }

  return [above, below];
}

export function renderBinarySparkLine(
  attr: IAttrAccessor<readonly (number | null)[]>,
  options: Partial<IBinarySparkLineOptions> = {}
): IVisualization {
  const o: IBinarySparkLineOptions = Object.assign(
    {
      scale: [-1, 1],
      centerValue: 0,
      aboveBackgroundColor: 'green',
      belowBackgroundColor: 'red',
      aboveLineColor: '',
      belowLineColor: '',
      borderColor: defaultColorOptions.borderColor,
      centerValueColor: defaultColorOptions.borderColor,
      padding: 1,
    },
    options
  );
  const acc = resolveAccessor(attr);
  const yScale01 = resolveScale(o.scale);
  const borderColor = resolveFunction(o.borderColor);
  const belowBackgroundColor = resolveFunction(o.belowBackgroundColor);
  const belowLineColor = resolveFunction(o.belowLineColor);
  const aboveBackgroundColor = resolveFunction(o.aboveBackgroundColor);
  const aboveLineColor = resolveFunction(o.aboveLineColor);
  const centerValueColor = resolveFunction(o.centerValueColor);

  const r: IVisualization = (ctx, node, dim) => {
    const value = acc(node);

    const bc = borderColor(node);
    if (bc) {
      ctx.strokeStyle = bc;
      ctx.strokeRect(0, 0, dim.width, dim.height);
    }

    if (value == null || !Array.isArray(value) || value.length === 0) {
      return;
    }

    const step = (dim.width - 2 * o.padding) / (value.length - 1);
    const xScale = (i: number) => i * step + o.padding;
    const yScale = (v: number) => (1 - yScale01(v)) * dim.height;

    const mLC = centerValueColor(node);
    const y = yScale(o.centerValue);
    if (mLC) {
      ctx.strokeStyle = mLC;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(dim.width, y);
      ctx.stroke();
    }

    const values = value.map((y, x) => ({ x, y }));
    const [above, below] = splitSegments(value, o.centerValue);

    const bBG = belowBackgroundColor(node);
    const aBG = aboveBackgroundColor(node);

    if (aBG) {
      ctx.fillStyle = aBG;
      renderArea(ctx, above, xScale, yScale, y);
    }
    if (bBG) {
      ctx.fillStyle = bBG;
      renderArea(ctx, below, xScale, yScale, y);
    }

    const bLC = belowLineColor(node);
    const aLC = aboveLineColor(node);

    if (aLC || bLC) {
      ctx.lineCap = 'round';
      if (aLC === bLC) {
        ctx.strokeStyle = aLC;
        renderLine(ctx, values, xScale, yScale);
      } else if (aLC) {
        ctx.strokeStyle = aLC;
        renderLine(ctx, above, xScale, yScale);
      } else if (bLC) {
        ctx.strokeStyle = bLC;
        renderLine(ctx, below, xScale, yScale);
      }
    }
  };

  r.defaultHeight = 20;
  r.defaultPosition = 'below';
  return r;
}
