import pkg from './package.json';
import rollupConfig from '../../scripts/build.config.js';

export default rollupConfig(
  pkg.name,
  [
    'vue',
    /^(@oinone|@kunlun||@vue|@wangeditor|vant\/|dayjs\/|vxe-table\/)/,
    'vuedraggable',
    'vxe-table',
    'xe-utils',
    '@ctrl/tinycolor',
    '@ant-design/icons-vue',
    'dayjs',
    'moment',
    'lodash-es',
    'vant',
    'smooth-signature'
  ],
  true,
  [],
  false
);
