import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { EditorFieldWidget } from '../../../../basic';
import { FormO2MModalSelectFieldWidget } from '../../../form';

@SPI.ClassFactory(
  EditorFieldWidget.Token({
    viewType: ViewType.Table,
    ttype: ModelFieldType.OneToMany,
    widget: ['ModalSelect', 'SelectModal']
  })
)
export class TableEditorO2MModalSelectFieldWidget extends FormO2MModalSelectFieldWidget {}
