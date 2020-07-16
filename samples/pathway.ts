namespace DefaultNS {
  declare const cytoscape: typeof import('cytoscape');
  // declare const CytoscapeLayers: typeof import('cytoscape-layers');
  declare const CytoscapeOverlays: typeof import('../dist');
  declare const cytoscapeSbgnStylesheet: any;

  const cy = cytoscape({
    container: document.getElementById('app'),
    layout: {
      name: 'preset',
    },
    style: cytoscapeSbgnStylesheet(cytoscape),
    elements: fetch('https://raw.githubusercontent.com/PathwayCommons/cytoscape-sbgn-stylesheet/master/demo.json')
      .then((r) => r.json())
      .then((r) =>
        r.map((d: any) => {
          d.data.expression = Math.random();
          d.data.annotationArray = Array(100)
            .fill(0)
            .map(() => Math.random());
          return d;
        })
      ),
  });
  cy.one('ready', () => {
    CytoscapeOverlays.overlays.call(
      cy,
      [
        {
          vis: CytoscapeOverlays.renderBar('expression', {
            backgroundColor: 'steelblue',
          }),
        },
        {
          vis: CytoscapeOverlays.renderBoxplot('annotationArray', {
            backgroundColor: 'darkred',
          }),
        },
        {
          vis: CytoscapeOverlays.renderHistogram('annotationArray', {
            backgroundColor: 'darkgreen',
          }),
        },
      ],
      {
        selector: '[class="macromolecule"]',
        updateOn: 'render',
        backgroundColor: '#f6f6f6',
      }
    );
  });
}
