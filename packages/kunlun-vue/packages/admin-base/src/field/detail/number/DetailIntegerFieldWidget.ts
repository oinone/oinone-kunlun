import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { BaseFieldWidget } from '../../../basic';
import { DetailNumberWidget } from './DetailNumberWidget';

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: ViewType.Detail,
    ttype: ModelFieldType.Integer
  })
)
export class DetailIntegerFieldWidget extends DetailNumberWidget {}
