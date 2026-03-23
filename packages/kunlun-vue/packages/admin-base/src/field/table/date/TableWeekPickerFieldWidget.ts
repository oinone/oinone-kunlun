import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { BaseFieldWidget } from '../../../basic';
import { TableDateFieldWidget } from './TableDateFieldWidget';

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: ViewType.Table,
    ttype: ModelFieldType.Date,
    widget: 'WeekPicker'
  })
)
export class TableWeekPickerFieldWidget extends TableDateFieldWidget {}
