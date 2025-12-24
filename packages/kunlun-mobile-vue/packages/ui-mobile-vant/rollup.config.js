import pkg from './package.json' with { type: 'json' };
import rollupConfig from '@oinone/kunlun-compile/dist/scripts/build.config.js';

export default rollupConfig({
  name: pkg.name,
  prefix: 'oinone-kunlun-vue-',
  external: [
    /^(@oinone|@kunlun|@vue|vant\/|dayjs\/)/,
    'lodash',
    'lodash-es',
    'moment',
    'vue',
    'vant',
    '@ant-design/icons-vue'
  ]
});
