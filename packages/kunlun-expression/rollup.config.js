import CompileConfigBuilder from '@oinone/kunlun-compile';

export default CompileConfigBuilder.config()
  .libraryName('oinone-kunlun-vue-expression')
  .external([
    'vue',
    'lodash-es',
    'ant-design-vue',
    '@ant-design/icons-vue',
    'element-plus',
    '@element-plus/icons-vue',
    'vuedraggable',
    /^(@oinone|@kunlun|@vue|@wangeditor)/
  ])
  .singleModule()
  .replace()
  .scss()
  .vue()
  .nodeResolve()
  .commonjs()
  .typescript2()
  .json()
  .terser({ keep_classnames: true })
  .sourcemaps()
  .build();
