import { createRequire } from 'node:module'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import typescript from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'
import nodePolyfills from 'rollup-plugin-polyfill-node'
import replace from '@rollup/plugin-replace'

const require = createRequire(import.meta.url)
const pkg = require('./package.json')
const plugs = [
  json(),
  resolve({
    preferBuiltins: false,
  }),
  commonjs(),
]

const external = [
  'crypto',
  'util',
  'zlib',
  'http',
  'https',
  'events',
  'stream',
  'url',
  'path',
  'fs',
  'assert',
  'tty',
  'os',
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
      entryFileNames: '[name].mjs',
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
    external,
  },

  // CommonJS
  {
    input: 'src/index.ts',
    output: {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
      exports: 'auto',
    },
    plugins: [
      ...plugs,
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        outDir: 'dist/cjs',
      }),
    ],
    external,
  },
  {
    input: 'src/index.ts',
    output: {
      file: pkg.browser,
      format: 'umd',
      name: 'DSSWeb3',
      sourcemap: true,
      globals: {
        crypto: 'crypto',
        global: 'window',
      },
    },
    plugins: [
      nodePolyfills({
        include: ['crypto'],
      }),
      replace({
        global: 'window',
        preventAssignment: true,
      }),
      resolve({
        preferBuiltins: false,
        browser: true,
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        outDir: 'dist/umd',
      }),
      terser(),
    ],
    external: [...external.filter((m) => m !== 'crypto')],
  },
]
