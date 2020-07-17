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
      {
        vis: CytoscapeOverlays.renderBar('value', {
          backgroundColor: 'steelblue',
        }),
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
      {
        vis: CytoscapeOverlays.renderHistogram('values', {
          backgroundColor: 'steelblue',
        }),
      },
    ],
    {
      layer,
      selector: '#histogram',
    }
  );
  CytoscapeOverlays.overlays.call(
    cy,
    [
      {
        vis: CytoscapeOverlays.renderBoxplot('values', {
          backgroundColor: 'steelblue',
        }),
      },
    ],
    {
      layer,
      selector: '#boxplot',
    }
  );
  CytoscapeOverlays.overlays.call(
    cy,
    [
      {
        vis: CytoscapeOverlays.renderSparkLine('values', {
          lineColor: 'steelblue',
        }),
      },
    ],
    {
      layer,
      selector: '#sparkline',
    }
  );
  CytoscapeOverlays.overlays.call(
    cy,
    [
      {
        vis: CytoscapeOverlays.renderBinarySparkLine('values', {}),
      },
    ],
    {
      layer,
      selector: '#binarySparkLine',
    }
  );
}
