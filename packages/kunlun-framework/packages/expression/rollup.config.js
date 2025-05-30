import pkg from './package.json';
import rollupConfig from '../../scripts/build.config.js';

export default rollupConfig(pkg.name, ['lodash-es', '@kunlun/shared', '@kunlun/spi']);
