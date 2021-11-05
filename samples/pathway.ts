/* eslint-disable @typescript-eslint/no-namespace */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace DefaultNS {
  declare const cytoscape: typeof import('cytoscape');
  // declare const CytoscapeLayers: typeof import('cytoscape-layers');
  declare const CytoscapeOverlays: typeof import('../build');
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
          d.data.favorite = Math.random() > 0.5;
          return d;
        })
      ),
  });
  cy.one('ready', () => {
    CytoscapeOverlays.overlays.call(
      cy,
      [
        CytoscapeOverlays.renderBar('expression', {
          backgroundColor: 'steelblue',
        }),
        CytoscapeOverlays.renderBoxplot('annotationArray', {
          backgroundColor: 'darkred',
        }),
        CytoscapeOverlays.renderHistogram('annotationArray', {
          backgroundColor: 'darkgreen',
        }),
        {
          vis: CytoscapeOverlays.renderSymbol({
            symbol: 'star',
            color: (node) => (node.data('favorite') ? 'yellow' : null),
          }),
          height: 16,
          width: 16,
        },
      ],
      {
        selector: '[class="macromolecule"]',
        updateOn: 'render',
        // backgroundColor: '#f6f6f6',
      }
    );
  });
}
