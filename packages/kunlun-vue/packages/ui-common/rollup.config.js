import copy from 'rollup-plugin-copy';
import pkg from './package.json';
import rollupConfig from '../../scripts/build.config.js';

export default rollupConfig(
  pkg.name,
  [
    './icons',
    '@oinone/kunlun-request',
    '@oinone/kunlun-shared',
    '@oinone/kunlun-meta',
    '@oinone/kunlun-engine',
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
