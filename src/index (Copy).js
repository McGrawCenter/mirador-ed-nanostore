import Mirador from 'mirador';
import miradorAnnotationEditorPlugin from 'mirador-annotation-editor';
import LocalStorageAdapter from './annotationAdapter/LocalStorageAdapter.js';
import NanostoreAdapter from './annotationAdapter/NanostoreAdapter.js';
import TestAdapter from './annotationAdapter/NanostoreAdapter.js';

const CustomMirador = {
  // Expose the adapter class so it's accessible outside the bundle
  NanostoreAdapter,
  TestAdapter, 
  
  viewer: (config, plugins = []) => {
    // Check if the user passed an adapter function in their config
    const userDefinedAdapter = config.annotation?.adapter;
    const userData = config.annotation?.userData;


    const mergedConfig = {
      ...config,
      annotation: {
        ...(config.annotation || {}),
        // Use your custom adapter function if it exists; otherwise, fall back to the default
        adapter: userDefinedAdapter || ((canvasId) => new LocalStorageAdapter(canvasId)),
      }
    };

    return Mirador.viewer(mergedConfig, [
      ...miradorAnnotationEditorPlugin,
      ...plugins
    ]);
  }
};

export default CustomMirador;
