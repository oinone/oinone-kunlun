import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { EditorFieldWidget } from '../../../../basic';
import { FormO2OModalSelectFieldWidget } from '../../../form';

@SPI.ClassFactory(
  EditorFieldWidget.Token({
    viewType: ViewType.Table,
    ttype: ModelFieldType.OneToOne,
    widget: ['ModalSelect', 'SelectModal']
  })
)
export class TableEditorO2OModalSelectFieldWidget extends FormO2OModalSelectFieldWidget {}
