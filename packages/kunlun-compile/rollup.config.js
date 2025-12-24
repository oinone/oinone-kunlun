import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';

export default {
  input: 'index.ts',
  output: [
    {
      file: `dist/index.min.js`,
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
  external: [
    '@rollup/plugin-replace',
    'rollup-plugin-scss',
    'rollup-plugin-vue',
    '@rollup/plugin-node-resolve',
    '@rollup/plugin-commonjs',
    '@rollup/plugin-typescript',
    'rollup-plugin-typescript2',
    '@rollup/plugin-json',
    'rollup-plugin-copy',
    '@rollup/plugin-terser',
    'rollup-plugin-sourcemaps'
  ],
  plugins: [
    nodeResolve(),
    commonjs(),
    typescript({
      tsconfig: 'tsconfig.json',
      compilerOptions: {
        outDir: 'dist',
        incremental: false,
        sourceMap: false,
        declaration: true,
        declarationDir: 'dist/types'
      },
      include: ['index.ts', 'src/**/*.ts'],
      exclude: ['node_modules', '**/__tests__/**/*.ts']
    }),
    copy({
      targets: [
        {
          src: './scripts/*',
          dest: 'dist/scripts'
        }
      ]
    }),
    terser()
  ]
};
