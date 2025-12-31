import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { EditorFieldWidget } from '../../../../basic';
import { FormEnumThumbnailFieldWidget } from '../../../form';

@SPI.ClassFactory(
  EditorFieldWidget.Token({
    viewType: ViewType.Table,
    ttype: ModelFieldType.Enum,
    widget: 'Thumbnail'
  })
)
export class TableEditorEnumThumbnailFieldWidget extends FormEnumThumbnailFieldWidget {}
