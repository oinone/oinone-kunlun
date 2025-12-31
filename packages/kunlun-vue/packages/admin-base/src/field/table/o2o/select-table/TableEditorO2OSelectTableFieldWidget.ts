import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { EditorFieldWidget } from '../../../../basic';
import { FormO2OSelectTableFieldWidget } from '../../../form';

@SPI.ClassFactory(
  EditorFieldWidget.Token({
    viewType: ViewType.Table,
    ttype: ModelFieldType.OneToOne,
    widget: 'SelectTable'
  })
)
export class TableEditorO2OSelectTableFieldWidget extends FormO2OSelectTableFieldWidget {}
