import type cy from 'cytoscape';
import type { IVisualization, OverlayPosition } from './visualizations';
import { layers, type ICanvasLayer, type ICanvasLayerOptions, renderPerNode, type INodeCanvasLayerOption } from 'cytoscape-layers';

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

function pick<T>(o: T, keys: (keyof T)[]): Partial<T> {
  const r: Partial<T> = {};
  for (const key of keys) {
    const v = o[key];
    if (v !== undefined) {
      r[key] = v;
    }
  }
  return r;
}

function stackVertical(pos: OverlayPosition) {
  return pos === 'top' || pos === 'bottom';
}
export function overlays(
  this: cy.Core,
  definitions: readonly (IOverlayVisualization | IVisualization)[],
  options: Partial<IOverlayPluginOptions> = {}
): { remove(): void } {
  const layer = options.layer || layers(this).nodeLayer.insertAfter('canvas', options);

  const overlayObjects = definitions.map(toFullVisualization);

  const someInit = overlayObjects.filter((d) => d.vis.init != null);

  const padding = options.padding == null ? 1 : options.padding;

  const positions: OverlayPosition[] = [
    'bottom-left',
    'bottom-right',
    'bottom',
    'left',
    'right',
    'top',
    'top-left',
    'top-right',
  ];

  const infos = positions
    .map((pos) => {
      const subset = overlayObjects.filter((d) => d.position === pos);
      const vertical = stackVertical(pos);
      return {
        pos,
        overlays: subset,
        total: subset.reduce((acc, overlay) => acc + (vertical ? overlay.height : overlay.width) + padding, -padding),
        maxOther: subset.reduce((acc, overlay) => Math.max(acc, vertical ? overlay.width : overlay.height), 0),
      };
    })
    .filter((d) => d.total > 0);

  const renderPerNodeOptions: Partial<INodeCanvasLayerOption> = Object.assign(
    {
      position: 'top-left',
    },
    someInit
      ? {
          initCollection: (nodes: cy.NodeCollection) => {
            for (const o of overlayObjects) {
              if (o.vis.init) {
                o.vis.init(nodes);
              }
            }
          },
        }
      : {},
    pick(options, ['boundingBox', 'checkBounds', 'queryEachTime', 'selector', 'updateOn'])
  );

  function cleanArea(ctx: CanvasRenderingContext2D, bb: cy.BoundingBox12 & cy.BoundingBoxWH) {
    if (!options.backgroundColor) {
      return;
    }
    ctx.fillStyle = options.backgroundColor;
    for (const info of infos) {
      switch (info.pos) {
        case 'bottom':
          ctx.fillRect(0, bb.h, bb.w, info.total);
          break;
        case 'bottom-left':
          ctx.fillRect(-info.overlays[0]!.width / 2, bb.h - info.maxOther / 2, info.total, info.maxOther);
          break;
        case 'bottom-right':
          ctx.fillRect(
            bb.w - info.total - info.overlays[0]!.width / 2,
            bb.h - info.maxOther / 2,
            info.total,
            info.maxOther
          );
          break;
        case 'left':
          ctx.fillRect(-info.total, 0, info.total, bb.h);
          break;
        case 'right':
          ctx.fillRect(bb.w, 0, info.total, bb.h);
          break;
        case 'top':
          ctx.fillRect(0, -info.total, bb.w, info.total);
          break;
        case 'top-left':
          ctx.fillRect(-info.overlays[0]!.width / 2, -info.maxOther / 2, info.total, info.maxOther);
          break;
        case 'top-right':
          ctx.fillRect(bb.w - info.total - info.overlays[0]!.width / 2, -info.maxOther / 2, info.total, info.maxOther);
          break;
      }
    }
  }

  function renderInfo(
    position: OverlayPosition,
    visualizations: Required<IOverlayVisualization>[],
    ctx: CanvasRenderingContext2D,
    node: cy.NodeSingular,
    bb: cy.BoundingBox12 & cy.BoundingBoxWH
  ) {
    switch (position) {
      case 'bottom':
        ctx.translate(0, bb.h);
        for (const overlay of visualizations) {
          overlay.vis(ctx, node, { width: bb.w, height: overlay.height, position });
          ctx.translate(0, overlay.height + padding);
        }
        break;
      case 'left':
        for (const overlay of visualizations) {
          ctx.translate(-overlay.width, 0);
          overlay.vis(ctx, node, { width: overlay.width, height: bb.h, position });
          ctx.translate(-padding, 0);
        }
        break;
      case 'right':
        ctx.translate(bb.w, 0);
        for (const overlay of visualizations) {
          overlay.vis(ctx, node, { width: overlay.width, height: bb.h, position });
          ctx.translate(overlay.width + padding, 0);
        }
        break;
      case 'top':
        for (const overlay of visualizations) {
          ctx.translate(0, -overlay.height);
          overlay.vis(ctx, node, { width: bb.w, height: overlay.height, position });
          ctx.translate(0, -padding);
        }
        break;
      case 'top-left':
      case 'bottom-left':
        // along the top line
        ctx.translate(-visualizations[0]!.width / 2, position === 'bottom-left' ? bb.h : 0);
        for (const overlay of visualizations) {
          ctx.translate(0, -overlay.height / 2);
          overlay.vis(ctx, node, { width: overlay.width, height: overlay.height, position });
          ctx.translate(padding + overlay.width, overlay.height / 2);
        }
        break;
      case 'top-right':
      case 'bottom-right':
        ctx.translate(bb.w + visualizations[0]!.width / 2, position === 'bottom-right' ? bb.h : 0);
        for (const overlay of visualizations) {
          ctx.translate(-overlay.width, -overlay.height / 2);
          overlay.vis(ctx, node, { width: overlay.width, height: overlay.height, position });
          ctx.translate(-padding, overlay.height / 2);
        }
        break;
    }
  }

  return renderPerNode(
    layer,
    (ctx, node, bb) => {
      const bak = ctx.getTransform();
      cleanArea(ctx, bb);
      for (const info of infos) {
        renderInfo(info.pos, info.overlays, ctx, node, bb);
        ctx.setTransform(bak);
      }
    },
    renderPerNodeOptions
  );
}
