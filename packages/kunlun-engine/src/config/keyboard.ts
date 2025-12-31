import { RuntimeConfigOptions } from '@oinone/kunlun-meta';

export interface KeyboardConfig extends RuntimeConfigOptions {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  desc?: string;
}
