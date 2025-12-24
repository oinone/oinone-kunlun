import copy from 'rollup-plugin-copy';
import pkg from './package.json' with { type: 'json' };
import rollupConfig from '@oinone/kunlun-compile/dist/scripts/build.config.js';

export default rollupConfig({
  name: pkg.name,
  prefix: 'oinone-kunlun-vue-',
  external: [
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
  extendPlugins: [
    copy({
      targets: [
        {
          src: './icons/*',
          dest: 'dist/icons'
        }
      ]
    })
  ]
});
