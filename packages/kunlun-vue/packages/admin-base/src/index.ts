import { RenderWidget as ViewTagCustomWidget } from '@kunlun/vue-widget';
import './spi-register';
import {
  CustomWidgetProps,
  registerCustomWidgetFunction,
  registerElementTag,
  registerPackTag,
  useTabWidgetTag
} from './tags';
import { createFlexContainerItem } from './tags/resolve/internal';

export {
  View,
  Field,
  Action,
  Element,
  Pack,
  Custom,
  ActionBar,
  ActionColumn,
  Col,
  Container,
  Containers,
  Dropdown,
  Group,
  Icon,
  Paragraph,
  Picture,
  Row,
  Search,
  Table,
  TextInfo,
  Tree,
  Tabs
} from './tags';

export * from './action';
export * from './typing';
export * from './create_app';
export * from './util';
// 下面这行只能单独导出
export * from './util/dsl-util';
export * from './basic';
export * from './components';
export * from './container';
export * from './field';
export * from './main-view';
export * from './spi';
export * from './view';
export * from './tags/mixin';
export * from './provider';
export * from './main';
export * from './tags/context';
export {
  CustomWidgetProps,
  ViewTagCustomWidget,
  registerCustomWidgetFunction,
  registerElementTag,
  registerPackTag,
  createFlexContainerItem,
  useTabWidgetTag
};

export * from './file';
export * from './icon-manage';
export * from './permission';
