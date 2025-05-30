import { MultiTabsManagerExtend } from './extend-manager';
import { MultiTabsManager } from './manager';

Object.assign(MultiTabsManager.INSTANCE, new MultiTabsManagerExtend());

export * from './typing';

export * from './config-manager';
export * from './config';
export * from './helper';
export * from './manager';
export * from './router';
