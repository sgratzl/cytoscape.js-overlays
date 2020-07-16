import { overlays } from './overlays';

export * from './visualizations';
export * from './overlays';

export default function register(
  cytoscape: (type: 'core' | 'collection' | 'layout', name: string, extension: any) => void
) {
  cytoscape('core', 'overlays', overlays);
}

// auto register
if (typeof (window as any).cytoscape !== 'undefined') {
  register((window as any).cytoscape);
}

export declare namespace cytoscape {
  type Ext2 = (cytoscape: (type: 'core' | 'collection' | 'layout', name: string, extension: any) => void) => void;
  function use(module: Ext2): void;

  interface Core {
    overlays: typeof overlays;
  }
}
