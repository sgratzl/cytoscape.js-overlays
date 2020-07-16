import { IAttrAccessor, IScale } from './interfaces';
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
