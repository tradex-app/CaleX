// vite.config.js

import path from 'path';
import { defineConfig } from 'vite';
import cleanup from 'rollup-plugin-cleanup';

const name = "CaleX Calendar";
const id = "calex";

export default defineConfig(({ command, mode }) => {
  if (command === 'build') {
    return {
      // build specific config
      build: {
        lib: {
          entry: path.resolve(__dirname, 'src/index.js'),
          name: name,
          fileName: (format) => `${id}.${format}.js`
        },
        emptyOutDir: true,
        target: "esnext",
        minify: "esbuild",
        rollupOptions: {
          // make sure to externalize deps that shouldn't be bundled into your library
          external: [
          ],
          output: {
            globals: {
              // vue: 'Vue'
            }
          },
          plugins: [
            cleanup()
          ]
        }
      },
    };
  } else if (command === 'serve') {
    // demo specific config
    return {
      // server: {
      //   open: '/demo.html'
      // }
      server: {
        host: true,
        // cors: false,
      }
    };
  } else if (command === 'test') {
    return {
      test: {
        environment: "jsdom", // or 'node'
        globals: true,
      },
    };
  } else {
    return {
      // dev / serve specific config
      server: {
        // host: true,
        // cors: false,
        proxy: {

        }
      }
    };
  }
});
