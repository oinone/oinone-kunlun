import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { EditorFieldWidget } from '../../../../basic';
import { FormO2OSelectModalFieldWidget } from '../../../form';

@SPI.ClassFactory(
  EditorFieldWidget.Token({
    viewType: ViewType.Table,
    ttype: ModelFieldType.OneToOne,
    widget: 'SelectModal'
  })
)
export class TableEditorO2OSelectModalFieldWidget extends FormO2OSelectModalFieldWidget {}
