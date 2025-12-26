import pkg from './package.json' with { type: 'json' };
import { rollupConfig } from '@oinone/kunlun-compile';

export default rollupConfig({
  pkg,
  prefix: 'oinone-kunlun-vue-',
  includeExternal: [
    '@ant-design/icons-vue',
    '@oinone/kunlun-dsl',
    '@oinone/kunlun-engine',
    '@oinone/kunlun-event',
    '@oinone/kunlun-environment',
    '@oinone/kunlun-expression',
    '@oinone/kunlun-meta',
    '@oinone/kunlun-request',
    '@oinone/kunlun-router',
    '@oinone/kunlun-service',
    '@oinone/kunlun-shared',
    '@oinone/kunlun-spi',
    '@oinone/kunlun-state',
    '@oinone/kunlun-vue-router',
    '@oinone/kunlun-vue-ui',
    '@oinone/kunlun-vue-ui-antd',
    '@oinone/kunlun-vue-ui-common',
    '@oinone/kunlun-vue-widget',
    'ant-design-vue',
    'lodash',
    'lodash-es',
    'vue'
  ]
});
