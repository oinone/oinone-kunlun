import { config } from '@vue/test-utils';
import 'reflect-metadata';
// const { translateValueByKey } = require('@oinone/kunlun-engine');
export const $translate = {
  install: (app) => {
    app.config.globalProperties.$translate = (text) => {
      return text;
    };
  }
};

global.console = {
  warn: jest.fn(),
  error: jest.fn()
};

config.global.plugins = [$translate];
