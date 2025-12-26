import pkg from './package.json' with { type: 'json' };
import { rollupConfig } from '@oinone/kunlun-compile';

export default rollupConfig({
  pkg,
  prefix: 'oinone-kunlun-vue-',
  includeExternal: [
    '@element-plus/icons-vue',
    '@oinone/kunlun-shared',
    '@oinone/kunlun-vue-ui-common',
    'element-plus',
    'lodash',
    'lodash-es',
    'vue'
  ]
});
