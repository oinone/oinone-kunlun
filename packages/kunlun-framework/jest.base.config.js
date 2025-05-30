const baseConfig = {
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
    ]
  },
  moduleNameMapper: {
    'lodash-es': 'lodash'
  },
  globals: {
    window: {}
  }
}

module.exports = baseConfig;