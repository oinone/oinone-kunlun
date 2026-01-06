import buildConfig from '@oinone/kunlun-test';

export default buildConfig({
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/src/jest.http-setup.ts']
});
