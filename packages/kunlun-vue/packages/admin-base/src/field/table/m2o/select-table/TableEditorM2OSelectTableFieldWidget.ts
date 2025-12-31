import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { EditorFieldWidget } from '../../../../basic';
import { FormM2OSelectTableFieldWidget } from '../../../form';

@SPI.ClassFactory(
  EditorFieldWidget.Token({
    viewType: ViewType.Table,
    ttype: ModelFieldType.ManyToOne,
    widget: 'SelectTable'
  })
)
export class TableEditorM2OSelectTableFieldWidget extends FormM2OSelectTableFieldWidget {}
