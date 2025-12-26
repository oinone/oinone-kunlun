import pkg from './package.json' with { type: 'json' };
import { rollupConfig } from '@oinone/kunlun-compile';

export default rollupConfig({
  pkg,
  prefix: 'oinone-kunlun-vue-',
  includeExternal: [
    /^(@oinone|@kunlun|@vue|vant\/|dayjs\/)/,
    'lodash',
    'lodash-es',
    'moment',
    'vue',
    'vant',
    '@ant-design/icons-vue'
  ]
});
