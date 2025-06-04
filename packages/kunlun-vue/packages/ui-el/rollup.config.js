import pkg from './package.json';
import rollupConfig from '../../scripts/build.config.js';

export default rollupConfig(pkg.name, [
  '@element-plus/icons-vue',
  '@oinone/kunlun-shared',
  '@oinone/kunlun-vue-ui-common',
  'element-plus',
  'lodash',
  'lodash-es',
  'vue'
]);
