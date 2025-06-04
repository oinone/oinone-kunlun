import pkg from './package.json';
import rollupConfig from '../../scripts/build.config.js';

export default rollupConfig(pkg.name, [
  '@oinone/kunlun-shared',
  '@oinone/kunlun-vue-ui-antd',
  '@oinone/kunlun-vue-ui-common',
  'lodash',
  'lodash-es',
  'vue',
  'vxe-table',
  'vxe-table/lib/style.min.css',
  'vxe-table-plugin-antd',
  'vxe-table-plugin-antd/dist/style.min.css',
  'vxe-table-plugin-element',
  'vxe-table-plugin-element/dist/style.min.css',
  'xe-utils',
  'vuedraggable'
]);
