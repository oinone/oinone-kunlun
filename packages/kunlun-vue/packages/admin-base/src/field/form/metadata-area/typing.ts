import { RuntimeAction, RuntimeModelField } from '@kunlun/engine';
import { ActionType } from '@kunlun/meta';
import type { TransferProps } from 'ant-design-vue';
import { definePropertyTranslate } from '../../../util';

export enum SelectWidgetType {
  FIELD = 'FIELD',
  ACTION = 'ACTION',
  FIELD_ACTION = 'FIELD_ACTION'
}

export type SelectInstance = {
  element: {
    metadataFields?: string[];
    properties: Record<string, unknown>;
    model: string;
    referenceModel?: string;
  };
};

type FieldsExtra = {
  isLeaf?: boolean;
  references?: string;
  key?: string;
  children?: SelectListType;
  type: SelectWidgetType;
  sort?: number;
  properties?: any;
  parentModel?: string;
  parentName?: string;
  deleted?: boolean;
};

export type SelectType = RuntimeModelField & RuntimeAction & FieldsExtra;

export type SelectListType = SelectType[];

export type FormValueItem = {
  label: string;
  name: string;
  type: SelectWidgetType;
  model: string;
  properties?: any;
  children?: FormValue;
};

export type FormValue = FormValueItem[];

export type TreeDataType = TransferProps['dataSource'] & SelectListType;

export type SourceDataCollection = Record<SelectWidgetType.FIELD | SelectWidgetType.ACTION, SelectListType>;

export enum ActionWidgetType {
  VIEW_ACTION = 'VIEW_ACTION',
  SERVER_ACTION = 'SERVER_ACTION',
  URL_ACTION = 'URL_ACTION',
  CLIENT_ACTION = 'CLIENT_ACTION'
}

export function convertActionType(type: ActionType | undefined): ActionWidgetType | undefined {
  if (!type) {
    return undefined;
  }
  switch (type) {
    case ActionType.View:
      return ActionWidgetType.VIEW_ACTION;
    case ActionType.Server:
      return ActionWidgetType.SERVER_ACTION;
    case ActionType.URL:
      return ActionWidgetType.URL_ACTION;
    case ActionType.Client:
      return ActionWidgetType.CLIENT_ACTION;
  }
  return undefined;
}

export type widgetTypeItem = {
  widgetAttrModel: string;
  widgetAttrFormViewName: string;
  widgetBizType: string;
  widgetSubtype: string;
  viewType: string;
  isDefault: boolean;
};

export type SortedFields = {
  sort?: number;
  items?: string[];
};

export const ActionTypeMap: Record<string, string> = {
  [ActionType.View]: '跳转动作',
  [ActionType.URL]: '链接动作',
  [ActionType.Client]: '客户端动作',
  [ActionType.Server]: '提交动作'
};

definePropertyTranslate(ActionTypeMap);

export const WidgetTypeMap: Record<string, string> = {
  [SelectWidgetType.FIELD]: '字段',
  [SelectWidgetType.ACTION]: '动作'
};

export const OioSelectMetadataProps = {
  readonly: {
    type: [Boolean],
    default: false
  },
  disabled: {
    type: [Boolean],
    default: false
  }
};
