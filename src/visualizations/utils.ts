import { IAttrAccessor, IScale, INodeFunction } from './interfaces';
import cy from 'cytoscape';

export function resolveAccessor<T>(attr: IAttrAccessor<T>): (v: cy.NodeSingular) => T | null {
  return typeof attr === 'function' ? attr : (node: cy.NodeSingular) => node.data(attr);
}

export function resolveScale(scale: IScale): (v: number) => number {
  if (typeof scale === 'function') {
    return scale;
  }
  const range = scale[1] - scale[0];
  const min = scale[0];
  return (v) => (v - min) / range;
}

export function resolveFunction<T extends string | number | boolean>(f: INodeFunction<T>): (v: cy.NodeSingular) => T {
  return typeof f === 'function' ? f : () => f as T;
}

export function autoResolveScale(scale: IScale, values: () => (number | null)[]) {
  if (typeof scale === 'function') {
    return scale;
  }
  if (!Number.isNaN(scale[0]) && Number.isNaN(scale[1])) {
    return resolveScale(scale);
  }
  // determine min max
  const { min, max } = values().reduce(
    (acc, v) => {
      if (v == null || Number.isNaN(v)) {
        return acc;
      }
      acc.min = Math.min(acc.min, v);
      acc.max = Math.max(acc.max, v);
      return acc;
    },
    { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY }
  );
  const fixedScale: [number, number] = [
    Number.isNaN(scale[0]) ? min : scale[0],
    Number.isNaN(scale[1]) ? max : scale[1],
  ];
  return resolveScale(fixedScale);
}
