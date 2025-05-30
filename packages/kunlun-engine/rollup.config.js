import replace from '@rollup/plugin-replace';

import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import commonjs from 'rollup-plugin-commonjs';
import json from '@rollup/plugin-json';

const libraryName = 'kunlun-engine';

const external = [
  '@kunlun/dsl',
  '@kunlun/event',
  '@kunlun/environment',
  '@kunlun/expression',
  '@kunlun/meta',
  '@kunlun/request',
  '@kunlun/router',
  '@kunlun/service',
  '@kunlun/shared',
  '@kunlun/cache',
  '@kunlun/spi',
  '@kunlun/state',
  '@kunlun/theme',
  '@kunlun/vue-widget',
  '@ctrl/tinycolor',
  'bignumber.js',
  'lodash',
  'lodash-es',
  'vue'
];

const tsconfigOverride = {
  compilerOptions: {
    outDir: 'dist',
    declaration: true,
    declarationDir: 'dist/types'
  },
  exclude: ['tests/**/*.ts', 'tests/**/*.tsx']
};

const plugins = [
  replace({
    'process.env.NODE_ENV': JSON.stringify('development'),
    preventAssignment: true
  }),
  terser(),
  nodeResolve(),
  typescript({ useTsconfigDeclarationDir: true, tsconfigOverride }),
  json(),
  commonjs()
];

export default {
  input: `index.ts`,
  output: [
    {
      file: `dist/${libraryName}.esm.js`,
      format: 'esm',
      sourcemap: false
    }
  ],
  onwarn(warning) {
    if (warning.code === 'THIS_IS_UNDEFINED' || /Circular/.test(warning.message)) {
      return;
    }

    console.error(warning.message);
  },
  external,
  plugins
};
