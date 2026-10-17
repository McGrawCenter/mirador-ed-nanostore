// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    // Both Mirador and MUI rely heavily on this definition to switch out of dev paths
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'CustomMirador', 
      formats: ['umd'],     
      fileName: () => `custom-mirador.js`
    },
    rollupOptions: {
      // CRITICAL: Clear out the external array completely.
      // This forces Vite to compile React, ReactDOM, and MUI 
      // directly into your custom-mirador.js bundle.
      external: [],
      output: {
        globals: {}
      }
    }
  }
});
