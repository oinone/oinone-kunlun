import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { FormFieldWidget } from '../../../basic';
import { DetailDateFieldWidget } from './DetailDateFieldWidget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Detail,
    ttype: ModelFieldType.Date,
    widget: 'WeekPicker'
  })
)
export class DetailWeekPickerFieldWidget extends DetailDateFieldWidget {}
