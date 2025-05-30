import pkg from './package.json';
import rollupConfig from '../../scripts/build.config.js';

export default rollupConfig(pkg.name, ['@kunlun/meta', '@kunlun/request', '@kunlun/router', '@kunlun/cache', '@kunlun/shared']);
