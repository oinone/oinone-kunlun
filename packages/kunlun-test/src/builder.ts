interface JestConfigBuilderOptions {
  tsconfig?: string;
  moduleNameMapper?: Record<string, string>;
  globals?: Record<string, unknown>;
  setupFiles?: string[];
  testEnvironment?: string;
  testEnvironmentOptions?: Record<string, unknown>;
}

export const buildConfig = (options?: JestConfigBuilderOptions) => {
  const { tsconfig, moduleNameMapper, globals, setupFiles, testEnvironment, testEnvironmentOptions } = options || {};
  const jestConfig = {
    testMatch: ['**/__tests__/**/*.(spec|test).(j|t)s?(x)'],
    transform: {
      '^.+\\.(j|t)sx?$': [
        'ts-jest',
        {
          tsconfig: tsconfig || 'tsconfig.json',
          diagnostics: {
            warnOnly: true
          },
          useESM: true
        }
      ]
    },
    moduleNameMapper: {
      'lodash-es': 'lodash',
      ...(moduleNameMapper || {})
    },
    globals: {
      window: {},
      ...(globals || {})
    },
    setupFiles: [`@oinone/kunlun-test/scripts/jest.setup.js`, ...(setupFiles || [])]
  };
  if (testEnvironment) {
    jestConfig.testEnvironment = testEnvironment;
  }
  if (testEnvironmentOptions) {
    jestConfig.testEnvironmentOptions = testEnvironmentOptions;
  }
  return jestConfig;
};
