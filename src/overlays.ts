import cy from 'cytoscape';
import { IVisualization } from './visualizations';
import { layers, ICanvasLayer, ICanvasLayerOptions, renderPerNode, INodeLayerOption } from 'cytoscape-layers';

export interface IOverlayVisualization {
  position?: 'above' | 'below';
  height?: number;
  vis: IVisualization;
}

export interface IOverlayPluginOptions extends ICanvasLayerOptions, INodeLayerOption {
  layer: ICanvasLayer;
  backgroundColor: string;
  padding: number;
}

function isAbove(d: IOverlayVisualization) {
  return d.position === 'above' || (d.position == null && d.vis.defaultPosition === 'above');
}

function getHeight(v: IOverlayVisualization) {
  return v.height || v.vis.defaultHeight || 5;
}

export function overlays(
  this: cy.Core,
  overlays: readonly (IOverlayVisualization | IVisualization)[],
  options: Partial<IOverlayPluginOptions> = {}
): { remove(): void } {
  const layer = options.layer || layers(this).nodeLayer.insertAfter('canvas', options);

  const overlayObjects = overlays.map((o) => (typeof o === 'function' ? { vis: o } : o));

  const padding = options.padding == null ? 1 : options.padding;
  const above = overlayObjects.filter(isAbove);
  const aboveHeight = above.reduce((acc, overlay) => acc + getHeight(overlay) + padding, -padding);
  const below = overlayObjects.filter((d) => !isAbove(d));
  const belowHeight = below.reduce((acc, overlay) => acc + getHeight(overlay) + padding, -padding);

  return renderPerNode(
    layer,
    (ctx, node, bb) => {
      const bak = ctx.getTransform();

      if (options.backgroundColor) {
        ctx.fillStyle = options.backgroundColor;
        if (aboveHeight > 0) {
          ctx.fillRect(0, -aboveHeight, bb.w, aboveHeight);
        }
        if (belowHeight > 0) {
          ctx.fillRect(0, bb.h, bb.w, belowHeight);
        }
      }

      for (const overlay of above) {
        const height = getHeight(overlay);
        ctx.translate(0, -height);
        overlay.vis(ctx, node, { width: bb.w, height });
        ctx.translate(0, -padding);
      }
      ctx.setTransform(bak);
      ctx.translate(0, bb.h);
      for (const overlay of below) {
        const height = getHeight(overlay);
        overlay.vis(ctx, node, { width: bb.w, height });
        ctx.translate(0, height + padding);
      }
    },
    Object.assign(
      {
        position: 'top-left',
      },
      options
    )
  );
}
