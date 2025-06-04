import pkg from './package.json';
import rollupConfig from '../../scripts/build.config.js';

export default rollupConfig(pkg.name, [
  /^(@oinone|@kunlun|@vue|vant\/|dayjs\/)/,
  'lodash',
  'lodash-es',
  'moment',
  'vue',
  'vant',
  '@ant-design/icons-vue'
]);
