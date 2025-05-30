import copy from 'rollup-plugin-copy';
import pkg from './package.json';
import rollupConfig from '../../scripts/build.config.js';

export default rollupConfig(
  pkg.name,
  [
    './icons',
    '@kunlun/request',
    '@kunlun/shared',
    '@kunlun/meta',
    '@kunlun/engine',
    '@vue/shared',
    'lodash',
    'lodash-es',
    'vue'
  ],
  true,
  [
    copy({
      targets: [
        {
          src: './icons/*',
          dest: 'dist/icons'
        }
      ]
    })
  ]
);
