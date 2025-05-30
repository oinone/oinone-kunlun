const baseConfig = require('../../jest.base.config');


module.exports = {
  ...baseConfig,
  moduleNameMapper: {
    'lodash-es': 'lodash'
  },
  globals: {
    window: {}
  },
  testEnvironment: 'jsdom',
  setupFiles: ['./jest.setup.js']
};
