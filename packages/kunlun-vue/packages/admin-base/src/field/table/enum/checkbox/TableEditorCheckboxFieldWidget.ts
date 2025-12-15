import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { EditorFieldWidget } from '../../../../basic';
import { FormEnumMultiCheckboxFieldWidget } from '../../../form';

@SPI.ClassFactory(
  EditorFieldWidget.Token({
    viewType: ViewType.Table,
    ttype: ModelFieldType.Enum,
    widget: 'Checkbox',
    multi: true
  })
)
export class TableEditorCheckboxFieldWidget extends FormEnumMultiCheckboxFieldWidget {}
