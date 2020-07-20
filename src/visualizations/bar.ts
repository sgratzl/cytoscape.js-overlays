import { IAttrAccessor, IScale, IVisualization, INodeFunction } from './interfaces';
import { resolveAccessor, resolveScale, resolveFunction, autoResolveScale } from './utils';

export interface IBarOptions {
  /**
   * the domain scale to use to map to the 0...1 scale
   * in the array version a value of NaN indicate to automatically derive it from the data
   * @default [0, NaN]
   */
  scale: IScale;
  /**
   * background color of the bar
   * @default '#cccccc'
   */
  backgroundColor: INodeFunction<string>;
  /**
   * border color to frame the bar
   * @default '#a0a0a0'
   */
  borderColor: INodeFunction<string>;
}

/**
 * @internal
 */
export const defaultColorOptions = {
  backgroundColor: '#cccccc',
  borderColor: '#a0a0a0',
};

/**
 * renders a horizontal or vertical bar
 * @param attr the accessor to the value of the node
 * @param options additional customization options
 */
export function renderBar(attr: IAttrAccessor<number>, options: Partial<IBarOptions> = {}): IVisualization {
  const o = Object.assign(
    {
      scale: [0, Number.NaN],
    },
    defaultColorOptions,
    options
  );
  const acc = resolveAccessor(attr);
  let scale = resolveScale(o.scale);
  const backgroundColor = resolveFunction(o.backgroundColor);
  const borderColor = resolveFunction(o.borderColor);

  const r: IVisualization = (ctx, node, dim) => {
    const value = acc(node);

    if (value != null && !Number.isNaN(value)) {
      ctx.fillStyle = backgroundColor(node);
      const v = scale(value);
      if (dim.position === 'left' || dim.position === 'right') {
        ctx.fillRect(0, dim.height * (1 - v), dim.width, v * dim.height);
      } else {
        ctx.fillRect(0, 0, dim.width * v, dim.height);
      }
    }

    const b = borderColor(node);
    if (b) {
      ctx.strokeStyle = b;
      ctx.strokeRect(0, 0, dim.width, dim.height);
    }
  };
  r.init = (nodes) => {
    scale = autoResolveScale(o.scale, () => nodes.map(acc));
  };
  r.defaultHeight = 5;
  r.defaultWidth = 5;
  r.defaultPosition = 'bottom';
  return r;
}
