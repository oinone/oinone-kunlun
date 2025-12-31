import { TableKeyboardConfig } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { EditorFieldWidget } from '../../../../basic';
import { FormM2MCompanyFieldWidget } from '../../../form';

@SPI.ClassFactory(
  EditorFieldWidget.Token({
    viewType: ViewType.Table,
    ttype: ModelFieldType.ManyToMany,
    widget: 'Company'
  })
)
export class TableEditorM2MCompanyFieldWidget extends FormM2MCompanyFieldWidget {
  @Widget.Reactive()
  @Widget.Inject('keyboardConfig')
  protected tableKeyboardConfig: TableKeyboardConfig | undefined;
}
