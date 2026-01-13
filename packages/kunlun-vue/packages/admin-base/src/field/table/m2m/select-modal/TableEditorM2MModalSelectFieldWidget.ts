import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { EditorFieldWidget } from '../../../../basic';
import { FormM2MModalSelectFieldWidget } from '../../../form';

@SPI.ClassFactory(
  EditorFieldWidget.Token({
    viewType: ViewType.Table,
    ttype: ModelFieldType.ManyToMany,
    widget: ['ModalSelect', 'SelectModal']
  })
)
export class TableEditorM2MModalSelectFieldWidget extends FormM2MModalSelectFieldWidget {}
