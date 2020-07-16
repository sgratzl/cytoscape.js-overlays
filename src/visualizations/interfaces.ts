import cy from 'cytoscape';

export interface IDimension {
  width: number;
  height: number;
}

export interface IVisualization {
  (ctx: CanvasRenderingContext2D, node: cy.NodeSingular, dim: IDimension): void;
  defaultHeight?: number;
  defaultPosition?: 'above' | 'below';
}

export declare type IAttrAccessor<T> = string | ((v: cy.NodeSingular) => T | null);

export declare type IScale = [number, number] | ((v: number) => number);
