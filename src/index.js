import Mirador from 'mirador';
import miradorAnnotationEditorPlugin from 'mirador-annotation-editor';
import LocalStorageAdapter from './annotationAdapter/LocalStorageAdapter.js';
import NanostoreAdapter from './annotationAdapter/NanostoreAdapter.js';

const CustomMirador = {
  NanostoreAdapter,

  viewer: (config, plugins = []) => {
    let miradorStore = null;

    const userDefinedAdapter = config.annotation?.adapter;

    const mergedConfig = {
      ...config,
      annotation: {
        ...(config.annotation || {}),

        adapter: (canvasId) => {
          const adapter = userDefinedAdapter
            ? userDefinedAdapter(canvasId)
            : new LocalStorageAdapter(
                `localStorage://?canvasId=${canvasId}`
              );

          // Inject a function that returns the current store.
          adapter._getMiradorStore = () => miradorStore;

          return adapter;
        },
      },
    };

    // Initialize Mirador with the merged configuration.
    const viewer = Mirador.viewer(mergedConfig, [
      ...miradorAnnotationEditorPlugin,
      ...plugins,
    ]);

    // Populate the variable captured by the adapter's closure.
    miradorStore = viewer.store;

    return viewer;
  },
};

export default CustomMirador;

