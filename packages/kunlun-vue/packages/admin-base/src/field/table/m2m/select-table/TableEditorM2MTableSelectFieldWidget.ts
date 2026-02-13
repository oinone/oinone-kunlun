import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { EditorFieldWidget } from '../../../../basic';
import { FormM2MTableSelectFieldWidget } from '../../../form';

@SPI.ClassFactory(
  EditorFieldWidget.Token({
    viewType: ViewType.Table,
    ttype: ModelFieldType.ManyToMany,
    widget: ['TableSelect', 'SelectTable']
  })
)
export class TableEditorM2MTableSelectFieldWidget extends FormM2MTableSelectFieldWidget {}
