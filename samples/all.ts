namespace AllNS {
  declare const cytoscape: typeof import('cytoscape');
  declare const CytoscapeLayers: typeof import('cytoscape-layers');
  declare const CytoscapeOverlays: typeof import('../dist');

  const cy = cytoscape({
    container: document.getElementById('app'),
    layout: {
      name: 'grid',
    },
    elements: [
      {
        data: {
          id: 'bar',
          value: Math.random(),
        },
      },
      {
        data: {
          id: 'histogram',
          values: Array(100)
            .fill(0)
            .map(() => Math.random()),
        },
      },
      {
        data: {
          id: 'boxplot',
          values: Array(100)
            .fill(0)
            .map(() => Math.random()),
        },
      },
      {
        data: {
          id: 'sparkline',
          values: Array(10)
            .fill(0)
            .map(() => Math.random()),
        },
      },
      {
        data: {
          id: 'binarySparkLine',
          values: Array(10)
            .fill(0)
            .map(() => Math.random() * 2 - 1),
        },
      },
      {
        data: {
          id: 'symbols',
        },
      },
    ],
    style: [
      {
        selector: 'node',
        style: {
          label: 'data(id)',
        },
      },
    ],
  });

  const layer = CytoscapeLayers.layers(cy).nodeLayer.insertAfter('canvas');
  layer.updateOnRender = true;
  CytoscapeOverlays.overlays.call(
    cy,
    [
      CytoscapeOverlays.renderBar('value', {
        backgroundColor: 'steelblue',
        scale: [0, 1],
      }),
      {
        vis: CytoscapeOverlays.renderBar('value', {
          backgroundColor: 'steelblue',
          scale: [0, 1],
        }),
        position: 'right',
      },
    ],
    {
      layer,
      selector: '#bar',
    }
  );
  CytoscapeOverlays.overlays.call(
    cy,
    [
      CytoscapeOverlays.renderHistogram('values', {
        backgroundColor: 'steelblue',
      }),
    ],
    {
      layer,
      selector: '#histogram',
    }
  );
  CytoscapeOverlays.overlays.call(
    cy,
    [
      CytoscapeOverlays.renderBoxplot('values', {
        backgroundColor: 'steelblue',
      }),
    ],
    {
      layer,
      selector: '#boxplot',
    }
  );
  CytoscapeOverlays.overlays.call(
    cy,
    [
      CytoscapeOverlays.renderSparkLine('values', {
        lineColor: 'steelblue',
      }),
    ],
    {
      layer,
      selector: '#sparkline',
    }
  );
  CytoscapeOverlays.overlays.call(cy, [CytoscapeOverlays.renderBinarySparkLine('values', {})], {
    layer,
    selector: '#binarySparkLine',
  });
  CytoscapeOverlays.overlays.call(
    cy,
    [
      {
        vis: CytoscapeOverlays.renderSymbol({
          symbol: 'circle',
        }),
        position: 'top-left',
      },
      {
        vis: CytoscapeOverlays.renderSymbol({
          symbol: 'diamond',
        }),
        position: 'top-right',
      },
      {
        vis: CytoscapeOverlays.renderSymbol({}),
        position: 'bottom-left',
      },
      {
        vis: CytoscapeOverlays.renderSymbol({
          symbol: 'star',
        }),
        position: 'bottom-right',
      },
    ],
    {
      layer,
      selector: '#symbols',
    }
  );
}
