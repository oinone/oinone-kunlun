// const { createDefaultPreset } = require('ts-jest')

module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(j|t)s?$': [
      'ts-jest',
      {
        diagnostics: {
          warnOnly: true
        },
        useESM: true
      }
    ]
  },
  setupFiles: ['./jest.setup.js'],
  extensionsToTreatAsEsm: ['.ts'],
  transformIgnorePatterns: ["/node_modules/(?!(@kunlun)/)"],
  moduleNameMapper: {
    '^lodash-es$': 'lodash'
  },
}