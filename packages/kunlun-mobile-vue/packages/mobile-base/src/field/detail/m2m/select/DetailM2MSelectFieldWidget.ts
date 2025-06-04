import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';

import { FormFieldWidget } from '../../../../basic';
import { DetailO2MSelectFieldWidget } from '../../o2m/DetailO2MSelectFieldWidget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Detail],
    ttype: ModelFieldType.ManyToMany,
    widget: 'Select'
  })
)
export class DetailM2MSelectFieldWidget extends DetailO2MSelectFieldWidget {}
