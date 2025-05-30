import pkg from './package.json';
import rollupConfig from '../../scripts/build.config.js';

export default rollupConfig(pkg.name, [
  '@element-plus/icons-vue',
  '@kunlun/shared',
  '@kunlun/vue-ui-common',
  'element-plus',
  'lodash',
  'lodash-es',
  'vue'
]);
