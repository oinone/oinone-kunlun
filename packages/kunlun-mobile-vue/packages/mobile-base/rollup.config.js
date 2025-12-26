import pkg from './package.json' with { type: 'json' };
import { rollupConfig } from '@oinone/kunlun-compile';

export default rollupConfig({
  pkg,
  prefix: 'oinone-kunlun-vue-',
  includeExternal: [
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
