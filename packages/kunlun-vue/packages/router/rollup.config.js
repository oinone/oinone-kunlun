import pkg from './package.json' with { type: 'json' };
import rollupConfig from '@oinone/kunlun-compile/dist/scripts/build.config.js';

export default rollupConfig({
  name: pkg.name,
  prefix: 'oinone-kunlun-vue-',
  external: ['@oinone/kunlun-router', '@oinone/kunlun-spi', '@oinone/kunlun-vue-widget', 'lodash', 'lodash-es', 'vue'],
  hasSCSS: false
});
