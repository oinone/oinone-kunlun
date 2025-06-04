import pkg from './package.json';
import rollupConfig from '../../scripts/build.config.js';

export default rollupConfig(
  pkg.name,
  [
    '@oinone/kunlun-dsl',
    '@oinone/kunlun-engine',
    '@oinone/kunlun-event',
    '@oinone/kunlun-meta',
    '@oinone/kunlun-router',
    '@oinone/kunlun-shared',
    '@oinone/kunlun-spi',
    '@oinone/kunlun-state',
    '@oinone/kunlun-vue-ui-common',
    'lodash',
    'lodash-es',
    'vue'
  ],
  false
);
