import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';

import { FormFieldWidget } from '../../../basic/field';
import { DetailM2oSelectFieldWidget } from '../m2o/DetailM2oSelectFieldWidget';

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
export class DetailO2OSelectFieldWidget extends DetailM2oSelectFieldWidget {}
