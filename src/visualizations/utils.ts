import { IAttrAccessor, IScale } from './interfaces';
import cy from 'cytoscape';
import { scaleLinear } from 'd3-scale';

export function resolveAccessor(attr: IAttrAccessor) {
  return typeof attr === 'function' ? attr : (node: cy.NodeSingular) => node.data(attr);
}

export function resolveScale(scale: IScale) {
  return typeof scale === 'function' ? scale : scaleLinear().domain(scale).range([0, 1]);
}
