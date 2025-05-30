import pkg from './package.json';
import rollupConfig from '../../scripts/build.config.js';

export default rollupConfig(
  pkg.name,
  [
    '@ant-design/icons-vue',
    '@kunlun/dsl',
    '@kunlun/engine',
    '@kunlun/event',
    '@kunlun/environment',
    '@kunlun/expression',
    '@kunlun/meta',
    '@kunlun/request',
    '@kunlun/router',
    '@kunlun/service',
    '@kunlun/shared',
    '@kunlun/spi',
    '@kunlun/state',
    '@kunlun/vue-router',
    '@kunlun/vue-ui',
    '@kunlun/vue-ui-antd',
    '@kunlun/vue-ui-common',
    '@kunlun/vue-widget',
    'ant-design-vue',
    'lodash',
    'lodash-es',
    'vue'
  ],
  true,
  [],
  false
);
