import type { TableKeyboardConfig } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { EditorFieldWidget } from '../../../../basic';
import { FormM2OSelectFieldWidget } from '../../../form';

@SPI.ClassFactory(
  EditorFieldWidget.Token({
    viewType: ViewType.Table,
    ttype: ModelFieldType.ManyToOne
  })
)
export class TableEditorM2OFieldWidget extends FormM2OSelectFieldWidget {
  @Widget.Reactive()
  @Widget.Inject('keyboardConfig')
  protected tableKeyboardConfig: TableKeyboardConfig | undefined;
}
