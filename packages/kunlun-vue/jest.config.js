const defaultConfig = {
  setupFiles: [__dirname + '/jest.setup.js'],
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons']
  },
  extensionsToTreatAsEsm: ['.ts', '.vue'],
  transform: {
    '^.+\\.(j|t)sx?$': [
      'ts-jest',
      {
        tsconfig: __dirname + '/tsconfig.json',
        diagnostics: {
          warnOnly: true
        },
        useESM: true,
        isolateModules: true
      }
    ],
    '.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
    '^.+\\.vue$': '@vue/vue3-jest'
  },
  moduleFileExtensions: ['js', 'ts', 'vue', 'css', 'sass'],
  moduleNameMapper: {
    '.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
    'iconfont\\.js$': __dirname + '/__mocks__/styleMock.js',
    '^ant-design-vue/es/(.*)$': 'ant-design-vue/lib/$1',
    'lodash-es': 'lodash'
  },
  snapshotSerializers: ['jest-serializer-vue'],
  globals: {
    window: {}
  }
};
module.exports = defaultConfig;
