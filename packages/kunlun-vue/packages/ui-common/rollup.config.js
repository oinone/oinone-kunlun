import copy from 'rollup-plugin-copy';
import pkg from './package.json' with { type: 'json' };
import { rollupConfig } from '@oinone/kunlun-compile';

export default rollupConfig({
  pkg,
  prefix: 'oinone-kunlun-vue-',
  includeExternal: [
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
  ],
  copyTypeFiles: {
    typesDir: 'kunlun-vue/packages/ui-common/*',
    deleteDir: 'kunlun-vue'
  }
});
