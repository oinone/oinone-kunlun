import pkg from './package.json' with { type: 'json' };
import { rollupConfig } from '@oinone/kunlun-compile';

export default rollupConfig({
  pkg,
  hasVue: false,
  hasSCSS: false,
  includeExternal: ['reflect-metadata', '@oinone/kunlun-shared'],
  copyTypeFiles: {
    typesDir: 'spi/*',
    deleteDir: 'spi'
  }
});
