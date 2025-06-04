import { DslDefinition } from '@oinone/kunlun-dsl';
import { BaseMaskWidgetProps } from '../../basic';

export interface CreateMaskWidgetProps extends BaseMaskWidgetProps {
  automatic?: boolean;
  template?: DslDefinition;
  parentHandle: string;
  slotName?: string;
  slotContext?: Record<string, unknown>;
}

export enum InternalMaskWidget {
  /**
   * 根标签
   */
  Mask = 'mask',

  /**
   * 通用组件
   */
  Widget = 'widget',

  // region 布局组件

  Header = 'header',
  Container = 'container',
  Content = 'content',
  Block = 'block',

  // endregion

  // region 功能性组件

  Sidebar = 'sidebar',
  Breadcrumb = 'breadcrumb',
  MultiTabs = 'multi-tabs'

  // endregion
}
