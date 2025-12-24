import pkg from './package.json' with { type: 'json' };
import rollupConfig from '@oinone/kunlun-compile/dist/scripts/build.config.js';

export default rollupConfig({
  name: pkg.name,
  hasVue: false,
  hasSCSS: false,
  external: ['@oinone/kunlun-shared', '@oinone/kunlun-spi', '@oinone/kunlun-state']
});
