import { ComputeContextManager } from './compute-context';
import { RuntimeContextManager } from './runtime-context';

RuntimeContextManager.onDelete((e) => {
  ComputeContextManager.delete(e.target.handle, false);
});

export * from './action';
export * from './auth';
export * from './business';
export * from './cache';
export * from './call-chaining';
export * from './config';
export * from './constant';
export * from './exception';
export * from './experimental';
export * from './field';
export * from './helper';
export * from './log';
export * from './provider';
export * from './router';
export * from './runtime-context';
export * from './runtime-metadata';
export * from './service';
export * from './state-stream';
export * from './submit';
export * from './typing';
export * from './user';
export * from './util';
export * from './view';
export * from './token-name';
export * from './compute-context';
export * from './resource-format-service';
