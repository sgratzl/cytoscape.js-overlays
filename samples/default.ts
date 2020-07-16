namespace DefaultNS {
  declare const cytoscape: typeof import('cytoscape');
  declare const CytoscapeLayers: typeof import('cytoscape-layers');
  declare const CytoscapeOverlays: typeof import('../dist');

  const cy = cytoscape({
    container: document.getElementById('app'),
    layout: {
      name: 'grid',
    },
    elements: [
      ...Array(100)
        .fill(0)
        .map((_, i) => ({
          data: {
            id: `i${i}`,
            label: `L${i}`,
            value: Math.random(),
            values: Array(100)
              .fill(0)
              .map(() => Math.random()),
          },
        })),
    ],
  });
  CytoscapeOverlays.overlays.call(cy, [
    {
      vis: CytoscapeOverlays.renderBar('value'),
    },
    {
      vis: CytoscapeOverlays.renderBoxplot('values'),
    },
  ]);
}
