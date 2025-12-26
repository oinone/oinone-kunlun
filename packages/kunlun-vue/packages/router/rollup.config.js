import pkg from './package.json' with { type: 'json' };
import { rollupConfig } from '@oinone/kunlun-compile';

export default rollupConfig({
  pkg,
  prefix: 'oinone-kunlun-vue-',
  includeExternal: ['@oinone/kunlun-router', '@oinone/kunlun-spi', '@oinone/kunlun-vue-widget', 'lodash', 'lodash-es', 'vue'],
  hasSCSS: false
});
