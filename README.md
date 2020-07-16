# Cytoscape Overlays

[![License: MIT][mit-image]][mit-url] [![NPM Package][npm-image]][npm-url] [![Github Actions][github-actions-image]][github-actions-url]

A [Cytoscape.js](https://js.cytoscape.org) plugin for adding layers that shows bars, histograms, or boxplots next to nodes.
Great for showing numerical attributes such as experimental data of pathways nodes.

![image](https://user-images.githubusercontent.com/4129778/87724422-be13c580-c7bb-11ea-83a4-28faa99672bc.png)

## Install

```sh
npm install --save cytoscape cytoscape-layers cytoscape-overlays
```

## Usage

```js
const cy = cytoscape({
  container: document.getElementById('app'),
  elements: [
    {
      data: {
        id: 'a',
        value: Math.random(),
        values: Array(100)
          .fill(0)
          .map(() => Math.random()),
      },
    },
    {
      data: {
        id: 'b',
        value: Math.random(),
        values: Array(100)
          .fill(0)
          .map(() => Math.random()),
      },
    },
    {
      data: {
        id: 'ab',
        source: 'a',
        target: 'b',
      },
    },
  ],
});
cy.overlays(
  [
    {
      position: 'above',
      vis: CytoscapeOverlays.renderBar('value', {
        backgroundColor: 'steelblue',
      }),
    },
    {
      vis: CytoscapeOverlays.renderBoxplot('values', {
        backgroundColor: 'darkred',
      }),
    },
    {
      vis: CytoscapeOverlays.renderHistogram('values', {
        backgroundColor: 'darkgreen',
      }),
    },
  ],
  {
    updateOn: 'render',
    backgroundColor: 'white',
  }
);
```

see [Samples](https://github.com/sgratzl/cytoscape.js-overlays/tree/master/samples) on Github

or at this [![Open in CodePen][codepen]](https://codepen.io/sgratzl/pen/TODO)

## Development Environment

```sh
npm i -g yarn
yarn set version latest
cat .yarnrc_patch.yml >> .yarnrc.yml
yarn
yarn pnpify --sdk vscode
```

### Common commands

```sh
yarn clean
yarn compile
yarn test
yarn lint
yarn fix
yarn build
yarn docs
yarn release
yarn release:pre
```

[mit-image]: https://img.shields.io/badge/License-MIT-yellow.svg
[mit-url]: https://opensource.org/licenses/MIT
[npm-image]: https://badge.fury.io/js/cytoscape-overlays.svg
[npm-url]: https://npmjs.org/package/cytoscape-overlays
[github-actions-image]: https://github.com/sgratzl/cytoscape.js-overlays/workflows/ci/badge.svg
[github-actions-url]: https://github.com/sgratzl/cytoscape.js-overlays/actions
[codepen]: https://img.shields.io/badge/CodePen-open-blue?logo=codepen
[codesandbox]: https://img.shields.io/badge/CodeSandbox-open-blue?logo=codesandbox
