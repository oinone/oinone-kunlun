import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { BaseFieldWidget } from '../../../basic';
import { TableNumberWidget } from '../number/TableNumberWidget';

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: [ViewType.Table],
    ttype: [ModelFieldType.Currency]
  })
)
export class TableCurrencyFieldWidget extends TableNumberWidget {}
