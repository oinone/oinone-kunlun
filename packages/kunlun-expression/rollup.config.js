import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import commonjs from 'rollup-plugin-commonjs';
import scss from 'rollup-plugin-scss';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import vue from 'rollup-plugin-vue';

const libraryName = 'oinone-kunlun-vue-expression';

const external = [
  'vue',
  'lodash-es',
  'ant-design-vue',
  '@ant-design/icons-vue',
  'element-plus',
  '@element-plus/icons-vue',
  'vuedraggable',
  /^(@kunlun|@vue|@wangeditor)/
];

const tsconfigOverride = {
  compilerOptions: {
    outDir: 'dist',
    declaration: true,
    declarationDir: 'dist/types'
  },
  include: ['index.ts', 'src/**/*.ts'],
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

  vue(),

  scss({
    fileName: `${libraryName}.scss`,
    output: 'dist',
    sourceMap: false,
    outputStyle: 'compressed'
  }),

  json(),
  commonjs()
];

export default {
  input: 'index.ts',
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
  plugins,
  external
};
