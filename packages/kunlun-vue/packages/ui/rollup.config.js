import pkg from './package.json' with { type: 'json' };
import rollupConfig from '@oinone/kunlun-compile/dist/scripts/build.config.js';

export default rollupConfig({
  name: pkg.name,
  prefix: 'oinone-kunlun-vue-',
  external: [
    '@oinone/kunlun-shared',
    '@oinone/kunlun-vue-ui-antd',
    '@oinone/kunlun-vue-ui-common',
    'lodash',
    'lodash-es',
    'vue',
    'vxe-table',
    'vxe-table/lib/style.min.css',
    'vxe-table/lib/v-x-e-table/src/conf',
    'vxe-table-plugin-antd',
    'vxe-table-plugin-antd/dist/style.min.css',
    'vxe-table-plugin-element',
    'vxe-table-plugin-element/dist/style.min.css',
    'xe-utils',
    'vuedraggable'
  ]
});
