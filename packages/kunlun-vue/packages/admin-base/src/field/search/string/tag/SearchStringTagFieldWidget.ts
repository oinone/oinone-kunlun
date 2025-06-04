import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { BaseFieldWidget } from '../../../../basic';
import { FormStringMultiTagFieldWidget } from '../../../form';

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: ViewType.Search,
    ttype: [
      ModelFieldType.String,
      ModelFieldType.Text,
      ModelFieldType.HTML,
      ModelFieldType.Phone,
      ModelFieldType.Email
    ],
    widget: 'Tag'
  })
)
export class SearchStringTagFieldWidget extends FormStringMultiTagFieldWidget {}
