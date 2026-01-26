import { config } from '@vue/test-utils';
import 'reflect-metadata';

global.console = {
  warn: jest.fn(),
  error: jest.fn()
};

config.global.plugins = [
  {
    install: (app) => {
      app.config.globalProperties.$translate = (text) => {
        return text;
      };
    }
  }
];
