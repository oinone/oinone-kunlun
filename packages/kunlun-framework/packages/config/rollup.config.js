import pkg from './package.json' with { type: 'json' };
import { rollupConfig } from '@oinone/kunlun-compile';

export default rollupConfig({
  pkg,
  hasVue: false,
  hasSCSS: false,
  includeExternal: ['@oinone/kunlun-spi', '@oinone/kunlun-shared']
});
