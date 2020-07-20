import cy from 'cytoscape';
import { IVisualization, OverlayPosition } from './visualizations';
import { layers, ICanvasLayer, ICanvasLayerOptions, renderPerNode, INodeCanvasLayerOption } from 'cytoscape-layers';

export interface IOverlayVisualization {
  position?: OverlayPosition;
  width?: number;
  height?: number;
  vis: IVisualization;
}

export interface IOverlayPluginOptions extends ICanvasLayerOptions, INodeCanvasLayerOption {
  layer: ICanvasLayer;
  backgroundColor: string;
  padding: number;
}

function toFullVisualization(o: IOverlayVisualization | IVisualization): Required<IOverlayVisualization> {
  const vis = typeof o === 'function' ? o : o.vis;
  return Object.assign(
    {
      vis,
      height: vis.defaultHeight || 5,
      width: vis.defaultWidth || 5,
      position: vis.defaultPosition || 'bottom',
    },
    typeof o === 'function' ? { vis: o } : o
  );
}

export function overlays(
  this: cy.Core,
  overlays: readonly (IOverlayVisualization | IVisualization)[],
  options: Partial<IOverlayPluginOptions> = {}
): { remove(): void } {
  const layer = options.layer || layers(this).nodeLayer.insertAfter('canvas', options);

  const overlayObjects = overlays.map(toFullVisualization);

  const padding = options.padding == null ? 1 : options.padding;

  const above = overlayObjects.filter((d) => d.position === 'above');
  const aboveHeight = above.reduce((acc, overlay) => acc + overlay.height + padding, -padding);

  const below = overlayObjects.filter((d) => d.position === 'below');
  const belowHeight = below.reduce((acc, overlay) => acc + overlay.height + padding, -padding);

  const above = overlayObjects.filter((d) => d.position === 'above');
  const aboveHeight = above.reduce((acc, overlay) => acc + overlay.height + padding, -padding);
  const below = overlayObjects.filter((d) => d.position === 'below');
  const belowHeight = below.reduce((acc, overlay) => acc + overlay.height + padding, -padding);

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
