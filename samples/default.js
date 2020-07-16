"use strict";
var DefaultNS;
(function (DefaultNS) {
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
})(DefaultNS || (DefaultNS = {}));
//# sourceMappingURL=default.js.map