import { IModelField, ModelFieldType, ViewType } from '@oinone/kunlun-meta';

// 新增类型后需要同步在 packages/core/src/extension/token.ts 的 baseWidgetArray常量对应的加一下
enum ViewFieldType {
  Empty = 'empty', // 特殊情况下用
  Input = 'Input',
  TextArea = 'TextArea',
  RichText = 'RichText',
  Checkbox = 'Checkbox',
  Select = 'Select',
  MultiSelect = 'MultiSelect',
  Count = 'Count',
  Integer = 'Integer',
  Float = 'Float',
  DatePicker = 'DatePicker',
  DateTimePicker = 'DateTimePicker',
  TimePicker = 'TimePicker',
  YearPicker = 'YearPicker',
  Radio = 'Radio',
  RadioGroup = 'RadioGroup',
  Switch = 'Switch',
  Upload = 'Upload',
  UploadImg = 'UploadImg',
  Email = 'Email',
  TreeSelect = 'TreeSelect',
  Phone = 'Phone',
  Currency = 'Currency',
  FilterList = 'FilterList',
  Table = 'Table',
  Form = 'Form'
}

const getDefaultFieldRenderType = (field: IModelField, viewType?: ViewType): ViewFieldType => {
  const { ttype, multi } = field;

  switch (ttype) {
    case ModelFieldType.Boolean: {
      return ViewFieldType.Switch;
    }
    case ModelFieldType.Integer:
    case ModelFieldType.Long: {
      return ViewFieldType.Integer;
    }
    case ModelFieldType.Float: {
      return ViewFieldType.Float;
    }
    case ModelFieldType.Currency: {
      return ViewFieldType.Currency;
    }
    case ModelFieldType.String: {
      return ViewFieldType.Input;
    }
    case ModelFieldType.Phone: {
      return ViewFieldType.Phone;
    }
    case ModelFieldType.Email: {
      return ViewFieldType.Email;
    }
    case ModelFieldType.Date: {
      return ViewFieldType.DatePicker;
    }
    case ModelFieldType.Time: {
      return ViewFieldType.TimePicker;
    }
    case ModelFieldType.Year: {
      return ViewFieldType.YearPicker;
    }
    case ModelFieldType.DateTime: {
      return ViewFieldType.DateTimePicker;
    }
    case ModelFieldType.Text: {
      return ViewFieldType.TextArea;
    }
    case ModelFieldType.HTML: {
      return ViewFieldType.RichText;
    }
    case ModelFieldType.Enum: {
      if (multi) {
        return ViewFieldType.MultiSelect;
      }
      return ViewFieldType.Select;
    }
    case ModelFieldType.Related: {
      return ViewFieldType.Input;
    }
    case ModelFieldType.OneToMany:
    case ModelFieldType.ManyToMany: {
      return ViewFieldType.Table;
    }
    case ModelFieldType.OneToOne: {
      return ViewFieldType.Form;
    }
    case ModelFieldType.ManyToOne: {
      return ViewFieldType.Select;
    }
    default: {
      return ViewFieldType.Input;
    }
  }
};

export { getDefaultFieldRenderType };
