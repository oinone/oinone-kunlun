import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';

import { FormFieldWidget } from '../../../basic/field';
import { GalleryM2OSelectFieldWidget } from '../m2o';

/**
 * o2o在详情的默认组件实现
 */
@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Gallery],
    ttype: ModelFieldType.OneToOne
  })
)
export class GalleryO2OSelectFieldWidget extends GalleryM2OSelectFieldWidget {}
