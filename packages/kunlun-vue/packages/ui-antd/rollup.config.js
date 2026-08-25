import { rollupConfig } from '@oinone/kunlun-compile';
import pkg from './package.json' with { type: 'json' };

export default rollupConfig({
  pkg,
  prefix: 'oinone-kunlun-vue-',
  includeExternal: [
    '@ant-design/icons-vue',
    '@oinone/kunlun-shared',
    '@oinone/kunlun-vue-ui-common',
    'ant-design-vue',
    /^ant-design-vue/,
    'lodash',
    'lodash-es',
    'moment',
    'vue',
    'vue-types'
  ],
  copyTypeFiles: {
    typesDir: 'kunlun-vue/packages/ui-antd/*',
    deleteDir: 'kunlun-vue'
  }
});
