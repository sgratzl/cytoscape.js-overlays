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
        .map((_, i) => ({ data: { id: `i${i}`, label: `L${i}` } })),
    ],
  });
  const layers = CytoscapeLayers.layers(cy);
  // render centered labels on each node
  layers.renderPerNode(layers.append('html'), () => {}, {
    init: (elem, node) => {
      elem.style.textAlign = 'center';
      elem.textContent = node.data('label') || node.id();
      elem.addEventListener('click', () => {
        console.log(node.id());
      });
    },
    transform: 'translate(-50%,-50%)',
    position: 'center',
    uniqueElements: true,
    checkBounds: false,
  });
}
