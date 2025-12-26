import pkg from './package.json' with { type: 'json' };
import { rollupConfig } from '@oinone/kunlun-compile';

export default rollupConfig({
  pkg,
  prefix: 'oinone-kunlun-vue-',
  includeExternal: [
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
  hasSCSS: false,
  copyTypeFiles: {
    typeDir: 'kunlun-vue/packages/widget',
    deleteDir: 'kunlun-vue'
  }
});
