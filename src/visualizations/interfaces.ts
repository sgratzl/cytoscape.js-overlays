import cy from 'cytoscape';

export interface IVisualization {
  (ctx: CanvasRenderingContext2D, node: cy.NodeSingular, y: number, width: number): number;
}

export declare type IAttrAccessor = string | ((v: cy.NodeSingular) => number);

export declare type IScale = [number, number] | ((v: number) => number);
