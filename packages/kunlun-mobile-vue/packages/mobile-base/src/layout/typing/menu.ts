import { IMenu } from '@oinone/kunlun-meta';

export interface RuntimeMenu extends IMenu {
  title: string;
}

export interface MenuUrlParameters {
  selectedKeys: string[];
  openKeys: string[];
}

export interface MenuUrlParameterOptions {
  selectedKeys?: string[];
  openKeys?: string[];
}
