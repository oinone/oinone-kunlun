import pkg from './package.json' with { type: 'json' };
import { rollupConfig } from '@oinone/kunlun-compile';

export default rollupConfig({
  pkg,
  hasVue: false,
  hasSCSS: false,
  includeExternal: [
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
