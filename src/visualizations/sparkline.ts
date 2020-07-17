import { IAttrAccessor, IVisualization, IScale, INodeFunction } from './interfaces';
import { resolveAccessor, resolveScale, resolveFunction } from './utils';
import { defaultColorOptions } from './bar';
import { renderLine, renderArea } from './lineUtils';

export interface ISparkLineOptions {
  scale: IScale;
  backgroundColor: INodeFunction<string>;
  lineColor: INodeFunction<string>;
  borderColor: INodeFunction<string>;
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
      borderColor: defaultColorOptions.borderColor,
      lineColor: defaultColorOptions.borderColor,
    },
    options
  );
  const acc = resolveAccessor(attr);
  const yScale01 = resolveScale(o.scale);
  const backgroundColor = resolveFunction(o.backgroundColor);
  const lineColor = resolveFunction(o.lineColor);
  const borderColor = resolveFunction(o.borderColor);

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

    const values = value.map((y, x) => ({ x, y }));

    const bg = backgroundColor(node);
    if (bg) {
      ctx.fillStyle = bg;
      renderArea(ctx, values, xScale, yScale, dim.height);
    }

    const lc = lineColor(node);
    if (lc) {
      ctx.lineCap = 'round';
      ctx.strokeStyle = lc;
      renderLine(ctx, values, xScale, yScale);
    }
  };

  r.defaultHeight = 20;
  r.defaultPosition = 'below';
  return r;
}
