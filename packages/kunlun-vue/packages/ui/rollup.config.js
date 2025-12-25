import pkg from './package.json' with { type: 'json' };
import { rollupConfig } from '@oinone/kunlun-compile';

export default rollupConfig({
  pkg,
  prefix: 'oinone-kunlun-vue-',
  includeExternal: [
    '@oinone/kunlun-shared',
    '@oinone/kunlun-vue-ui-antd',
    '@oinone/kunlun-vue-ui-common',
    'lodash',
    'lodash-es',
    'vue',
    'vxe-table',
    'vxe-table/lib/style.min.css',
    'vxe-table/lib/v-x-e-table/src/conf.min.js',
    'vxe-table-plugin-antd',
    'vxe-table-plugin-antd/dist/style.min.css',
    'vxe-table-plugin-element',
    'vxe-table-plugin-element/dist/style.min.css',
    'xe-utils',
    'vuedraggable'
  ]
});
