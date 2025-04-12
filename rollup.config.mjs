import { createRequire } from 'node:module'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import typescript from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'

const require = createRequire(import.meta.url)
const pkg = require('./package.json')
const plugs = [
  json(),
  resolve({
    preferBuiltins: false,
  }),
  commonjs(),
]

/**
 * @type {import('rollup').RollupOptions}
 */
export default [
  // ESM
  {
    input: 'src/index.ts',
    output: {
      dir: 'dist/esm',
      format: 'esm',
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: 'src',
    },
    plugins: [
      ...plugs,
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: 'dist/esm/types',
        outDir: 'dist/esm',
      }),
    ],
  },

  // CommonJS
  // {
  //   input: 'src/index.ts',
  //   output: {
  //     file: pkg.main,
  //     format: 'cjs',
  //     sourcemap: true,
  //     exports: 'auto',
  //   },
  //   plugins: [
  //     ...plugs,
  //     typescript({
  //       tsconfig: './tsconfig.json',
  //       declaration: false,
  //       outDir: 'dist/cjs',
  //     }),
  //   ],
  // },
  // {
  //   input: 'src/index.ts',
  //   output: {
  //     file: pkg.browser,
  //     format: 'umd',
  //     name: 'DSSWeb3',
  //     sourcemap: true,
  //   },
  //   plugins: [
  //     resolve(),
  //     commonjs(),
  //     typescript({
  //       tsconfig: './tsconfig.json',
  //       declaration: false,
  //       outDir: 'dist/umd',
  //     }),
  //     terser(),
  //   ],
  // },
]
