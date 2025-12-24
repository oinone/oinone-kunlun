import pkg from './package.json' with { type: 'json' };
import rollupConfig from '@oinone/kunlun-compile/dist/scripts/build.config.js';

export default rollupConfig({
  name: pkg.name,
  hasVue: false,
  hasSCSS: false,
  external: [
    '@rsql/builder',
    '@rsql/emitter',
    '@rsql/parser',
    'bignumber.js',
    'lodash',
    'lodash-es',
    'dayjs',
    'crypto-js',
    'moment'
  ]
});
