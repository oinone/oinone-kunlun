import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

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
  external: [],
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
    terser()
  ]
};
