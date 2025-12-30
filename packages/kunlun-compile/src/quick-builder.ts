import { Plugin as RollupPlugin } from 'rollup';
import { CompileConfigBuilder } from './builder';

interface QuickBuilderOptions {
  pkg: {
    name: string;
    version: string;
    dependencies?: Record<string, unknown>;
    devDependencies?: Record<string, unknown>;
  };
  prefix?: string;
  includeExternal?: string[];
  excludeExternal?: string[];
  hasVue?: boolean;
  hasSCSS?: boolean;
  ugly?: boolean;
  keep_classnames?: boolean;
  extendPlugins?: RollupPlugin[];
  outputEntryFiles?: boolean;
  copyTypeFiles?: {
    typesDir: string;
    deleteDir: string | string[];
  };
  debug?: boolean;
}

export const rollupConfig = ({
  pkg,
  prefix = 'oinone-kunlun-',
  includeExternal,
  excludeExternal,
  hasVue = true,
  hasSCSS = true,
  ugly = true,
  keep_classnames = true,
  extendPlugins,
  outputEntryFiles = false,
  copyTypeFiles,
  debug
}: QuickBuilderOptions) => {
  const defaultExternal: (string | RegExp)[] = [];
  pushExternal(defaultExternal, Object.keys(pkg.dependencies || {}));
  pushExternal(defaultExternal, Object.keys(pkg.devDependencies || {}));
  const finalExternal = [
    ...new Set([...defaultExternal, ...(includeExternal || [])]).difference(new Set([...(excludeExternal || [])]))
  ];
  const builder = CompileConfigBuilder.config(debug)
    .prefix(pkg.name, prefix)
    .external(finalExternal)
    .multipleModule()
    .replace()
    .nodeResolve()
    .commonjs()
    .json()
    .plugins(extendPlugins);
  if (hasVue) {
    builder.vue().typescript2();
  } else {
    builder.typescript2();
  }
  if (hasSCSS) {
    builder.scss();
  }
  if (ugly) {
    builder.terser({ keep_classnames });
  }
  if (copyTypeFiles) {
    builder.copyTypeFiles(copyTypeFiles.typesDir, copyTypeFiles.deleteDir);
  }
  if (outputEntryFiles) {
    return builder.build({
      outputOverride: {
        dir: 'dist',
        entryFileNames: `${builder.libraryName}.esm.js`,
        format: 'esm',
        sourcemap: false
      }
    });
  }
  return builder.build();
};

function escapeRegExp(str) {
  // 正则特殊字符：^ $ \ . * + ? | ( ) [ ] { } ,
  return str.replace(/[\\^$.*+?|()[\]{}]/g, '\\$&');
}

function pushExternal(array: (string | RegExp)[], external: string[]) {
  for (const value of external) {
    array.push(value);
    array.push(new RegExp(`^${escapeRegExp(value)}`));
  }
}
