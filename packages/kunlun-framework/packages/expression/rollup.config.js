import pkg from './package.json' with { type: 'json' };
import { rollupConfig } from '@oinone/kunlun-compile';

export default rollupConfig({
  pkg,
  hasVue: false,
  hasSCSS: false,
  includeExternal: ['lodash-es', '@oinone/kunlun-shared', '@oinone/kunlun-spi'],
  copyTypeFiles: {
    typesDir: 'expression/*',
    deleteDir: 'expression'
  }
});
