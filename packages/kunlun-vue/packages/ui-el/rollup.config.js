import pkg from './package.json' with { type: 'json' };
import rollupConfig from '@oinone/kunlun-compile/dist/scripts/build.config.js';

export default rollupConfig({
  name: pkg.name,
  prefix: 'oinone-kunlun-vue-',
  external: [
    '@element-plus/icons-vue',
    '@oinone/kunlun-shared',
    '@oinone/kunlun-vue-ui-common',
    'element-plus',
    'lodash',
    'lodash-es',
    'vue'
  ]
});
