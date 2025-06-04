import pkg from './package.json';
import rollupConfig from '../../scripts/build.config.js';

export default rollupConfig(pkg.name, ['lodash-es', '@oinone/kunlun-shared', '@oinone/kunlun-spi']);
