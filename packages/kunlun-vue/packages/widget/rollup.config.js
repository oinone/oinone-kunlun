import pkg from './package.json' with { type: 'json' };
import rollupConfig from '@oinone/kunlun-compile/dist/scripts/build.config.js';

export default rollupConfig({
  name: pkg.name,
  prefix: 'oinone-kunlun-vue-',
  external: [
    '@oinone/kunlun-dsl',
    '@oinone/kunlun-engine',
    '@oinone/kunlun-event',
    '@oinone/kunlun-meta',
    '@oinone/kunlun-router',
    '@oinone/kunlun-shared',
    '@oinone/kunlun-spi',
    '@oinone/kunlun-state',
    '@oinone/kunlun-vue-ui-common',
    '@oinone/kunlun-config',
    'lodash',
    'lodash-es',
    'vue',
    '@vue/runtime-core'
  ],
  hasSCSS: false
});
