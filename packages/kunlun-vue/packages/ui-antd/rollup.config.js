import pkg from './package.json';
import rollupConfig from '../../scripts/build.config.js';

export default rollupConfig(pkg.name, [
  '@ant-design/icons-vue',
  '@kunlun/shared',
  '@kunlun/vue-ui-common',
  'ant-design-vue',
  'ant-design-vue/lib/_util/hooks/useConfigInject.js',
  'ant-design-vue/lib/tabs/src/TabContext.js',
  'lodash',
  'lodash-es',
  'moment',
  'vue'
]);
