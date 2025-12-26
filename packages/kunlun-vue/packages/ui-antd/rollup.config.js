import pkg from './package.json' with { type: 'json' };
import { rollupConfig } from '@oinone/kunlun-compile';

export default rollupConfig({
  pkg,
  prefix: 'oinone-kunlun-vue-',
  includeExternal: [
    '@ant-design/icons-vue',
    '@oinone/kunlun-shared',
    '@oinone/kunlun-vue-ui-common',
    'ant-design-vue',
    'ant-design-vue/lib/_util/hooks/useConfigInject.js',
    'ant-design-vue/lib/tabs/src/TabContext.js',
    'lodash',
    'lodash-es',
    'moment',
    'vue'
  ]
});
