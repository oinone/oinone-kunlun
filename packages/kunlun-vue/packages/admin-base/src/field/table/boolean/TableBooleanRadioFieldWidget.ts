import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { BaseFieldWidget } from '../../../basic';
import { TableBooleanSelectFieldWidget } from './TableBooleanSelectFieldWidget';

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: ViewType.Table,
    ttype: ModelFieldType.Boolean,
    widget: 'Radio'
  })
)
export class TableBooleanRadioFieldWidget extends TableBooleanSelectFieldWidget {}
