import pkg from './package.json';
import rollupConfig from '../../scripts/build.config.js';

export default rollupConfig(pkg.name, ['@kunlun/shared', '@kunlun/spi', '@kunlun/state']);
