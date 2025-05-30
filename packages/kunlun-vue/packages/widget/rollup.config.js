import pkg from './package.json';
import rollupConfig from '../../scripts/build.config.js';

export default rollupConfig(
  pkg.name,
  [
    '@kunlun/dsl',
    '@kunlun/engine',
    '@kunlun/event',
    '@kunlun/meta',
    '@kunlun/router',
    '@kunlun/shared',
    '@kunlun/spi',
    '@kunlun/state',
    '@kunlun/vue-ui-common',
    'lodash',
    'lodash-es',
    'vue'
  ],
  false
);
