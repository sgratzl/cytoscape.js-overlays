import cy from 'cytoscape';

export type OverlayPosition =
  | 'top'
  | 'bottom'
  | 'right'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

export interface IDimension {
  position: OverlayPosition;
  width: number;
  height: number;
}

export interface IVisualization {
  init?: (node: cy.NodeCollection) => void;

  (ctx: CanvasRenderingContext2D, node: cy.NodeSingular, dim: IDimension): void;

  defaultWidth?: number;
  defaultHeight?: number;
  defaultPosition?: OverlayPosition;
}

export declare type IAttrAccessor<T> = string | ((v: cy.NodeSingular) => T | null);

export declare type IScale = [number, number] | ((v: number) => number);

export declare type INodeFunction<T extends string | number | boolean> = T | ((v: cy.NodeSingular) => T);
