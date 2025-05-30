import { ModelFieldType, ViewType } from '@kunlun/meta';
import { CustomWidgetProps } from '../typing';

export interface ViewWidgetProps extends CustomWidgetProps {
  type: ViewType;
  widget?: string;
}

export interface ActionWidgetProps extends CustomWidgetProps {
  model: string;
  name: string;
  actionType?: string;
  widget?: string;
}

export interface FieldWidgetProps extends CustomWidgetProps {
  model: string;
  data: string;
  widget: string;
  ttype: ModelFieldType;
  relatedTtype: ModelFieldType;
  sortable?: boolean;
}

export interface ElementWidgetProps extends CustomWidgetProps {
  viewType?: ViewType;
  widget?: string;
}

export interface PackWidgetProps extends CustomWidgetProps {
  viewType?: ViewType;
  widget?: string;
}
