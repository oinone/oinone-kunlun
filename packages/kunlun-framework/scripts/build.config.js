import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import sourceMaps from 'rollup-plugin-sourcemaps';
import { terser } from 'rollup-plugin-terser';

const packagePrefix = 'oinone-kunlun-';

export const buildName = (name) => {
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

const plugins = (pathName) => [
  terser(),
  nodeResolve(),
  typescript({
    tsconfig: '../../tsconfig.json',
    useTsconfigDeclarationDir: true,
    tsconfigOverride: tsconfigOverride(pathName)
  }),
  commonjs(),
  sourceMaps()
];

const rollupConfig = (name = '', external = []) => {
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
    plugins: plugins(pathName)
  };
};

export default rollupConfig;
