import pkg from './package.json' with { type: 'json' };
import rollupConfig from '@oinone/kunlun-compile/dist/scripts/build.config.js';

export default rollupConfig({
  name: pkg.name,
  prefix: 'oinone-kunlun-vue-',
  external: [
    'vue',
    /^(@oinone|@kunlun|@vue|@wangeditor|vant\/|dayjs\/|vxe-table\/)/,
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
  ugly: false
});
