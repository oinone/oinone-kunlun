import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { EditorFieldWidget } from '../../../../basic';
import { FormO2MSelectTableFieldWidget } from '../../../form';

@SPI.ClassFactory(
  EditorFieldWidget.Token({
    viewType: ViewType.Table,
    ttype: ModelFieldType.OneToMany,
    widget: 'SelectTable'
  })
)
export class TableEditorO2MSelectTableFieldWidget extends FormO2MSelectTableFieldWidget {}
