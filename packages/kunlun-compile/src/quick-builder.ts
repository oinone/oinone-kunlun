import { RollupConfigBuilder } from './builder';

export const rollupConfig = ({
  name = '',
  prefix = 'oinone-kunlun-',
  external = [],
  hasVue = true,
  hasSCSS = true,
  ugly = true,
  keep_classnames = false,
  extendPlugins,
  outputEntryFiles = false
}) => {
  const builder = RollupConfigBuilder.config()
    .prefix(name, prefix)
    .external(external)
    .multipleModule()
    .replace()
    .nodeResolve()
    .commonjs()
    .json()
    .plugins(extendPlugins);
  if (hasVue) {
    builder.vue().typescript2({ check: false });
  } else {
    builder.typescript();
  }
  if (hasSCSS) {
    builder.scss();
  }
  if (ugly) {
    builder.terser({ keep_classnames });
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
