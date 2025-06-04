import pkg from './package.json';
import rollupConfig from '../../scripts/build.config.js';

export default rollupConfig(
  pkg.name,
  ['@oinone/kunlun-router', '@oinone/kunlun-spi', '@oinone/kunlun-vue-widget', 'lodash', 'lodash-es', 'vue'],
  false
);
