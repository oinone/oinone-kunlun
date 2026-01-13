import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { EditorFieldWidget } from '../../../../basic';
import { FormM2OTableSelectFieldWidget } from '../../../form';

@SPI.ClassFactory(
  EditorFieldWidget.Token({
    viewType: ViewType.Table,
    ttype: ModelFieldType.ManyToOne,
    widget: ['TableSelect', 'SelectTable']
  })
)
export class TableEditorM2OTableSelectFieldWidget extends FormM2OTableSelectFieldWidget {}
