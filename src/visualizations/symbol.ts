import {
  symbolCircle,
  symbolCross,
  symbolDiamond,
  symbolSquare,
  symbolStar,
  symbolTriangle,
  SymbolType,
  symbolWye,
} from 'd3-shape';
import { INodeFunction, IVisualization } from './interfaces';
import { resolveFunction } from './utils';

const symbols = {
  circle: symbolCircle,
  cross: symbolCross,
  diamond: symbolDiamond,
  square: symbolSquare,
  star: symbolStar,
  triangle: symbolTriangle,
  wye: symbolWye,
};

export interface ITextSymbol {
  text: string;
  font?: string;
}

export interface ISymbolOptions {
  symbol: INodeFunction<keyof typeof symbols | CanvasImageSource | SymbolType | ITextSymbol>;
  color: INodeFunction<string>;
}

function isSymbol(s: any): s is SymbolType {
  return typeof (s as SymbolType).draw === 'function';
}

function isTextSymbol(s: any): s is ITextSymbol {
  return typeof (s as ITextSymbol).text === 'string';
}

export function renderSymbol(options: Partial<ISymbolOptions> = {}): IVisualization {
  const o = Object.assign(
    {
      symbol: 'circle',
      color: '#cccccc',
    } as ISymbolOptions,
    options
  );
  const symbol = resolveFunction(o.symbol);
  const backgroundColor = resolveFunction(o.color);

  const r: IVisualization = (ctx, node, dim) => {
    ctx.fillStyle = backgroundColor(node);
    const s = symbol(node);

    if (isSymbol(s) || typeof s === 'string') {
      const sym = isSymbol(s) ? s : symbols[s as keyof typeof symbols] || symbolCircle;
      ctx.translate(dim.width / 2, dim.height / 2);
      ctx.beginPath();
      sym.draw(ctx, 0.5 * (dim.width * dim.height));
      ctx.fill();
      ctx.translate(-dim.width / 2, -dim.height / 2);
    } else if (isTextSymbol(s)) {
      ctx.save();
      if (s.font) {
        ctx.font = s.font;
      }
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.text, dim.width / 2, dim.height / 2);
      ctx.restore();
    } else {
      // image source
      ctx.drawImage(s as CanvasImageSource, 0, 0, dim.width, dim.height);
    }
  };
  r.defaultHeight = 8;
  r.defaultWidth = 8;
  r.defaultPosition = 'top-left';
  return r;
}
