/* eslint-disable @typescript-eslint/no-var-requires */
const defaultConfig = require('./jest.base.config');
const spiPkg = require('./packages/spi/package.json');
const dslPkg = require('./packages/dsl/package.json');
const cachePkg = require('./packages/cache/package.json');
const envPkg = require('./packages/environment/package.json');
const expPkg = require('./packages/expression/package.json');
const metaPkg = require('./packages/meta/package.json');
const requestPkg = require('./packages/request/package.json');
const routerPkg = require('./packages/router/package.json');
const servicePkg = require('./packages/service/package.json');
const sharedPkg = require('./packages/shared/package.json');
const statePkg = require('./packages/state/package.json');
const themePkg = require('./packages/theme/package.json');

module.exports = {
  projects: [
    {
      ...defaultConfig,
      displayName: cachePkg.name,
      moduleNameMapper: {
        'lodash-es': 'lodash'
      },
      testMatch: ['<rootDir>/packages/cache/**/?(*.)+(spec|test).[jt]s?(x)'],
      globals: {
        window: {}
      }
    },
    {
      ...defaultConfig,
      displayName: envPkg.name,
      moduleNameMapper: {
        'lodash-es': 'lodash'
      },
      testMatch: ['<rootDir>/packages/environment/**/?(*.)+(spec|test).[jt]s?(x)'],
      globals: {
        window: {}
      }
    },
    {
      ...defaultConfig,
      displayName: expPkg.name,
      moduleNameMapper: {
        'lodash-es': 'lodash'
      },
      testMatch: ['<rootDir>/packages/expression/**/?(*.)+(spec|test).[jt]s?(x)'],
      globals: {
        window: {}
      }
    },
    {
      ...defaultConfig,
      displayName: metaPkg.name,
      moduleNameMapper: {
        'lodash-es': 'lodash'
      },
      testMatch: ['<rootDir>/packages/meta/**/?(*.)+(spec|test).[jt]s?(x)'],
      globals: {
        window: {}
      }
    },
    {
      ...defaultConfig,
      displayName: requestPkg.name,
      moduleNameMapper: {
        'lodash-es': 'lodash'
      },
      testMatch: ['<rootDir>/packages/request/**/?(*.)+(spec|test).[jt]s?(x)'],
      globals: {
        window: {}
      },
      testEnvironment: 'jsdom',
      setupFiles: ['./jest.setup.js']
    },
    {
      ...defaultConfig,
      displayName: routerPkg.name,
      moduleNameMapper: {
        'lodash-es': 'lodash'
      },
      testMatch: ['<rootDir>/packages/router/**/?(*.)+(spec|test).[jt]s?(x)'],
      globals: {
        window: {}
      }
    },
    {
      ...defaultConfig,
      displayName: servicePkg.name,
      moduleNameMapper: {
        'lodash-es': 'lodash'
      },
      testMatch: ['<rootDir>/packages/service/**/?(*.)+(spec|test).[jt]s?(x)'],
      globals: {
        window: {}
      }
    },
    {
      ...defaultConfig,
      displayName: sharedPkg.name,
      moduleNameMapper: {
        'lodash-es': 'lodash'
      },
      testMatch: ['<rootDir>/packages/shared/**/?(*.)+(spec|test).[jt]s?(x)'],
      globals: {
        window: {}
      }
    },
    {
      ...defaultConfig,
      displayName: statePkg.name,
      moduleNameMapper: {
        'lodash-es': 'lodash'
      },
      testMatch: ['<rootDir>/packages/state/**/?(*.)+(spec|test).[jt]s?(x)'],
      globals: {
        window: {}
      }
    },
    {
      ...defaultConfig,
      displayName: themePkg.name,
      moduleNameMapper: {
        'lodash-es': 'lodash'
      },
      testMatch: ['<rootDir>/packages/theme/**/?(*.)+(spec|test).[jt]s?(x)'],
      globals: {
        window: {}
      }
    },
    {
      ...defaultConfig,
      displayName: spiPkg.name,
      moduleNameMapper: {
        'lodash-es': 'lodash'
      },
      testMatch: ['<rootDir>/packages/spi/**/?(*.)+(spec|test).[jt]s?(x)'],
      globals: {
        window: {}
      }
    },
    {
      ...defaultConfig,
      displayName: dslPkg.name,
      testMatch: ['<rootDir>/packages/dsl/**/?(*.)+(spec|test).[jt]s?(x)']
    }
  ]
};
