import { IAttrAccessor, IVisualization, IScale, INodeFunction } from './interfaces';
import { resolveAccessor, resolveScale, resolveFunction } from './utils';
import { defaultColorOptions } from './bar';

export interface ISparkLineOptions {
  scale: IScale;
  backgroundColor: INodeFunction<string>;
  lineColor: INodeFunction<string>;
  padding: number;
}

export function renderSparkLine(
  attr: IAttrAccessor<readonly (number | null)[]>,
  options: Partial<ISparkLineOptions> = {}
): IVisualization {
  const o: ISparkLineOptions = Object.assign(
    {
      scale: [0, 1],
      backgroundColor: '',
      padding: 1,
      lineColor: defaultColorOptions.borderColor,
    },
    options
  );
  const acc = resolveAccessor(attr);
  const yScale01 = resolveScale(o.scale);
  const backgroundColor = resolveFunction(o.backgroundColor);
  const lineColor = resolveFunction(o.lineColor);

  const r: IVisualization = (ctx, node, dim) => {
    const value = acc(node);

    if (value == null || !Array.isArray(value) || value.length === 0) {
      return;
    }

    const step = (dim.width - 2 * o.padding) / (value.length - 1);
    const xScale = (i: number) => i * step + o.padding;
    const yScale = (v: number) => (1 - yScale01(v)) * dim.height;

    const bg = backgroundColor(node);
    if (bg) {
      ctx.fillStyle = bg;
      ctx.beginPath();
      let first = true;
      let lastIndex: number | null = null;
      for (let i = 0; i < value.length; i++) {
        const v = value[i];
        if (v == null || Number.isNaN(v)) {
          continue;
        }
        lastIndex = i;
        if (first) {
          ctx.moveTo(xScale(i), dim.height);
          ctx.lineTo(xScale(i), yScale(v));
          first = false;
        } else {
          ctx.lineTo(xScale(i), yScale(v));
        }
      }
      if (lastIndex != null) {
        ctx.lineTo(xScale(lastIndex), dim.height);
        ctx.closePath();
      }
      ctx.fill();
    }

    const lc = lineColor(node);
    if (lc) {
      ctx.strokeStyle = lc;
      ctx.lineCap = 'round';
      ctx.beginPath();
      let first = true;
      for (let i = 0; i < value.length; i++) {
        const v = value[i];
        if (v == null || Number.isNaN(v)) {
          continue;
        }
        if (first) {
          ctx.moveTo(xScale(i), yScale(v));
          first = false;
        } else {
          ctx.lineTo(xScale(i), yScale(v));
        }
      }
      ctx.stroke();
    }
  };

  r.defaultHeight = 20;
  r.defaultPosition = 'below';
  return r;
}
