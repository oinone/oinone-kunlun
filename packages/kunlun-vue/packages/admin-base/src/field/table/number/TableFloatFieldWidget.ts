import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { BaseFieldWidget } from '../../../basic';
import { TableNumberWidget } from './TableNumberWidget';

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: ViewType.Table,
    ttype: ModelFieldType.Float
  })
)
export class TableFloatFieldWidget extends TableNumberWidget {}
