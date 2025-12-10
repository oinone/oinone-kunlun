import { TableKeyboardConfig } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { EditorFieldWidget } from '../../../../basic';
import { FormEnumMultiSelectFieldWidget } from '../../../form';

@SPI.ClassFactory(
  EditorFieldWidget.Token({
    viewType: ViewType.Table,
    ttype: ModelFieldType.Enum,
    multi: true
  })
)
export class TableEditorMultiEnumFieldWidget extends FormEnumMultiSelectFieldWidget {
  @Widget.Reactive()
  @Widget.Inject('keyboardConfig')
  protected tableKeyboardConfig: TableKeyboardConfig | undefined;
}
