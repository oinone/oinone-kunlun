import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';

import { FormFieldWidget } from '../../../basic/field';
import { DetailM2OSelectFieldWidget } from '../m2o/DetailM2OSelectFieldWidget';

/**
 * o2o在详情的默认组件实现
 */
@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Detail],
    ttype: ModelFieldType.OneToOne,
    widget: 'Select'
  })
)
export class DetailO2OSelectFieldWidget extends DetailM2OSelectFieldWidget {}
