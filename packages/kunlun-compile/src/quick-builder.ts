import { Plugin as RollupPlugin } from 'rollup';
import { CompileConfigBuilder } from './builder';

interface QuickBuilderOptions {
  pkg: {
    name: string;
    version: string;
    dependencies?: Record<string, unknown>;
    devDependencies?: Record<string, unknown>;
  };
  prefix?: boolean;
  includeExternal?: string[];
  excludeExternal?: string[];
  hasVue?: boolean;
  hasSCSS?: boolean;
  ugly?: boolean;
  keep_classnames?: boolean;
  extendPlugins?: RollupPlugin[];
  outputEntryFiles?: boolean;
  copyTypeFiles?: boolean | string;
}

export const rollupConfig = ({
  pkg,
  prefix = 'oinone-kunlun-',
  includeExternal,
  excludeExternal,
  hasVue = true,
  hasSCSS = true,
  ugly = true,
  keep_classnames = false,
  extendPlugins,
  outputEntryFiles = false,
  copyTypeFiles
}: QuickBuilderOptions) => {
  const finalExternal = [
    ...new Set([
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.devDependencies || {}),
      ...(includeExternal || [])
    ]).difference(new Set([...(excludeExternal || [])]))
  ];
  const builder = CompileConfigBuilder.config()
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
  if (typeof copyTypeFiles === 'boolean') {
    if (copyTypeFiles) {
      builder.copyTypeFiles();
    }
  } else if (typeof copyTypeFiles === 'string') {
    builder.copyTypeFiles(copyTypeFiles);
  }
  if (outputEntryFiles) {
    return builder.build({
      output: {
        dir: 'dist',
        entryFileNames: `${builder.getLibraryName()}.esm.js`,
        file: null
      }
    });
  }
  return builder.build();
};
