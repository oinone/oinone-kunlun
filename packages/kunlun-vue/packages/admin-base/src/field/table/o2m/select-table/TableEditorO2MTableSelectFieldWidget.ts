import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { EditorFieldWidget } from '../../../../basic';
import { FormO2MTableSelectFieldWidget } from '../../../form';

@SPI.ClassFactory(
  EditorFieldWidget.Token({
    viewType: ViewType.Table,
    ttype: ModelFieldType.OneToMany,
    widget: ['TableSelect', 'SelectTable']
  })
)
export class TableEditorO2MTableSelectFieldWidget extends FormO2MTableSelectFieldWidget {}
