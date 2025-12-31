import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { EditorFieldWidget } from '../../../../basic';
import { FormO2MSelectModalFieldWidget } from '../../../form';

@SPI.ClassFactory(
  EditorFieldWidget.Token({
    viewType: ViewType.Table,
    ttype: ModelFieldType.OneToMany,
    widget: 'SelectModal'
  })
)
export class TableEditorO2MSelectModalFieldWidget extends FormO2MSelectModalFieldWidget {}
