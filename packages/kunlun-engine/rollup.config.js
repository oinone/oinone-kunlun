import CompileConfigBuilder from '@oinone/kunlun-compile';

export default CompileConfigBuilder.config()
  .setLibraryName('oinone-kunlun-engine')
  .external([
    '@oinone/kunlun-dsl',
    '@oinone/kunlun-event',
    '@oinone/kunlun-environment',
    '@oinone/kunlun-expression',
    '@oinone/kunlun-meta',
    '@oinone/kunlun-request',
    '@oinone/kunlun-router',
    '@oinone/kunlun-service',
    '@oinone/kunlun-shared',
    '@oinone/kunlun-cache',
    '@oinone/kunlun-spi',
    '@oinone/kunlun-state',
    '@oinone/kunlun-theme',
    '@oinone/kunlun-vue-widget',
    '@ctrl/tinycolor',
    'bignumber.js',
    'lodash',
    'lodash-es',
    'vue'
  ])
  .singleModule()
  .replace()
  .nodeResolve()
  .commonjs()
  .typescript2()
  .json()
  .terser({ keep_classnames: true })
  .sourcemaps()
  .build();
