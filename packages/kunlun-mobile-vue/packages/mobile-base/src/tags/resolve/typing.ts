import { DslDefinition } from '@oinone/kunlun-dsl';
import { ViewType } from '@oinone/kunlun-meta';
import { DslDefinitionWidgetProps, VueWidget } from '@oinone/kunlun-vue-widget';

export enum ResolveMode {
  DEFAULT,
  NORMAL,
  FLEX
}

/**
 * 自定义组件属性，仅提供内置的环境属性
 */
export interface CustomWidgetProps extends DslDefinitionWidgetProps, DslDefinition {
  viewType?: ViewType;
  parentHandle: string;

  resolveOptions?: {
    mode?: ResolveMode;
  };
}

export interface CustomWidget {
  handle: string;
  widget: VueWidget;
  widgets: VueWidget[];
}

export enum InternalWidget {
  View = 'view',
  Field = 'field',
  Action = 'action',
  Element = 'element',
  Pack = 'pack',
  Custom = 'custom',

  Table = 'table',
  Search = 'search',
  Dropdown = 'dropdown',

  ActionBar = 'action-bar',
  ActionColumn = 'action-column',
  RowActions = 'row-actions',

  Block = 'Block',
  Group = 'group',
  Row = 'row',
  Col = 'col',
  Containers = 'containers',
  Container = 'container',
  Tabs = 'tabs',
  Tab = 'tab',
  Card = 'card',
  Tree = 'tree',
  CardCascader = 'card-cascader',

  TextInfo = 'textInfo',
  Paragraph = 'paragraph',
  Picture = 'picture',
  Icon = 'icon',

  // datetime
  DateTimeRangePicker = 'date-time-range-picker',
  DateRangePicker = 'date-range-picker',
  TimeRangePicker = 'time-range-picker',
  YearRangePicker = 'year-range-picker',

  Template = 'template'
}
