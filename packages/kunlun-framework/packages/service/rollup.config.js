import pkg from './package.json';
import rollupConfig from '../../scripts/build.config.js';

export default rollupConfig(pkg.name, [
  '@oinone/kunlun-meta',
  '@oinone/kunlun-request',
  '@oinone/kunlun-router',
  '@oinone/kunlun-cache',
  '@oinone/kunlun-shared'
]);
