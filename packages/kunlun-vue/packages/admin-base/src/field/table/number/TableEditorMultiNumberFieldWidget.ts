import type { TableKeyboardConfig } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { EditorFieldWidget } from '../../../basic';
import { FormIntegerMultiFieldWidget } from '../../form';

@SPI.ClassFactory(
  EditorFieldWidget.Token({
    viewType: ViewType.Table,
    ttype: [ModelFieldType.Integer, ModelFieldType.Float, ModelFieldType.Currency],
    multi: true
  })
)
export class TableEditorMultiNumberFieldWidget extends FormIntegerMultiFieldWidget {
  @Widget.Reactive()
  @Widget.Inject('keyboardConfig')
  protected tableKeyboardConfig: TableKeyboardConfig | undefined;
}
