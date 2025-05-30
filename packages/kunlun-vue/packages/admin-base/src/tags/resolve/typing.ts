import { DslDefinition } from '@kunlun/dsl';
import { ViewType } from '@kunlun/meta';
import { DslDefinitionWidgetProps, VueWidget } from '@kunlun/vue-widget';

export enum ResolveMode {
  DEFAULT,
  NORMAL,
  FLEX
}

export enum FlexRowStyleValue {
  Flex = 'flex',
  Wrap = 'wrap',
  Nowrap = 'nowrap'
}

export enum FlexColStyleValue {
  Full = '1 1 0',
  Auto = '0 0 auto'
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
  PackCombination = 'PackCombination',
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
