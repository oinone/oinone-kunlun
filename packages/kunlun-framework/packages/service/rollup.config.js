import pkg from './package.json' with { type: 'json' };
import rollupConfig from '@oinone/kunlun-compile/dist/scripts/build.config.js';

export default rollupConfig({
  name: pkg.name,
  hasVue: false,
  hasSCSS: false,
  external: [
    '@oinone/kunlun-meta',
    '@oinone/kunlun-request',
    '@oinone/kunlun-router',
    '@oinone/kunlun-cache',
    '@oinone/kunlun-shared'
  ]
});
