import vue from 'rollup-plugin-vue';
import replace from '@rollup/plugin-replace';
import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import scss from 'rollup-plugin-scss';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';

const packagePrefix = 'oinone-kunlun-vue-';

const buildName = (name) => {
  const libraryName = name.replace('@', '').replace('/', '-');
  const pathName = libraryName.substring(packagePrefix.length);
  const camelCaseName = libraryName.replace(/-(\w)/g, (all, letter) => letter.toUpperCase());
  return { libraryName, pathName, camelCaseName };
};

const tsconfigOverride = (pathName) => {
  const basePath = `packages/${pathName}`;
  return {
    compilerOptions: {
      outDir: `${basePath}/dist`,
      declaration: true,
      declarationDir: `${basePath}/dist/types`
    },
    include: [`${basePath}/index.ts`, `${basePath}/src/**/*.ts`],
    exclude: [`${basePath}/tests/**/*.ts`, `${basePath}/tests/**/*.tsx`]
  };
};

const plugins = (hasSCSS, libraryName, pathName, ugly) => {
  const rst = [
    replace({
      'process.env.NODE_ENV': JSON.stringify('development'),
      preventAssignment: true
    }),
    nodeResolve(),
    typescript({
      tsconfig: '../../tsconfig.json',
      useTsconfigDeclarationDir: true,
      tsconfigOverride: tsconfigOverride(pathName)
    }),
    vue(),
    hasSCSS
      ? scss({
          fileName: `${libraryName}.scss`,
          output: 'dist',
          sourceMap: false,
          outputStyle: 'compressed'
        })
      : undefined,
    json(),
    commonjs()
  ];

  if (ugly) {
    rst.push(terser({ keep_classnames: true }));
  }

  return rst;
};

const rollupConfig = (name = '', external = [], hasSCSS = true, extendPlugins, ugly = true) => {
  const { libraryName, pathName } = buildName(name);
  return {
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
    external,
    plugins: plugins(hasSCSS, libraryName, pathName, ugly).concat(extendPlugins || [])
  };
};

export default rollupConfig;
