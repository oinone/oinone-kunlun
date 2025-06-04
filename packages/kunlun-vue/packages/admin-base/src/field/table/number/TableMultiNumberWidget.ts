import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { BaseFieldWidget } from '../../../basic';
import { TableStringTagFieldWidget } from '../string';

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: ViewType.Table,
    ttype: [ModelFieldType.Integer, ModelFieldType.Float, ModelFieldType.Currency],
    multi: true
  })
)
export class TableMultiNumberWidget extends TableStringTagFieldWidget {}
