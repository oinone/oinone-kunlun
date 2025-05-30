import pkg from './package.json';
import rollupConfig from '../../scripts/build.config.js';

export default rollupConfig(
  pkg.name,
  ['@kunlun/router', '@kunlun/spi', '@kunlun/vue-widget', 'lodash', 'lodash-es', 'vue'],
  false
);
