import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { BaseFieldWidget } from '../../../basic';
import { GalleryNumberWidget } from './GalleryNumberWidget';

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: ViewType.Gallery,
    ttype: ModelFieldType.Currency
  })
)
export class GalleryMoneyFieldWidget extends GalleryNumberWidget {}
