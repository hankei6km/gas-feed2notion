import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'
import license from 'rollup-plugin-license'
import * as path from 'path'
import { fileURLToPath } from 'node:url'

const extensions = ['.ts', '.js']

export default {
  input: './src/main.ts',
  output: {
    dir: 'build',
    format: 'iife',
    name: '_entry_point_'
  },
  plugins: [
    typescript(),
    nodeResolve({
      extensions
    }),
    commonjs({}),
    json(),
    license({
      sourcemap: false,
      // cwd: ".", // Default is process.cwd()

      // banner: {
      //   commentStyle: "regular", // The default

      //   content: {
      //     file: path.join(__dirname, "LICENSE"),
      //     encoding: "utf-8", // Default is utf-8
      //   },

      //   data() {
      //     return {};
      //   },
      // },

      thirdParty: {
        // includePrivate: true, // Default is false.
        output: {
          file: path.join(
            path.dirname(fileURLToPath(import.meta.url)),
            'build',
            'OPEN_SOURCE_LICENSES.txt'
          ),
          encoding: 'utf-8' // Default is utf-8.
        }
      }
    })
  ]
}
