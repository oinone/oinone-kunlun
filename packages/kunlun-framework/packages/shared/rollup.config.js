import pkg from './package.json';
import rollupConfig from '../../scripts/build.config.js';

export default rollupConfig(pkg.name, [
  '@rsql/builder',
  '@rsql/emitter',
  '@rsql/parser',
  'bignumber.js',
  'lodash',
  'lodash-es',
  'dayjs',
  'crypto-js',
  'moment'
]);
