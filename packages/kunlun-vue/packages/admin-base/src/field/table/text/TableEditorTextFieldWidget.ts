import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { isNaN } from 'lodash-es';
import { EditorFieldWidget } from '../../../basic';
import { FormTextFieldWidget } from '../../form';

@SPI.ClassFactory(
  EditorFieldWidget.Token({
    viewType: ViewType.Table,
    ttype: ModelFieldType.Text
  })
)
export class TableEditorTextFieldWidget extends FormTextFieldWidget {
  @Widget.Reactive()
  protected get rows(): number {
    const rows = Number(this.getDsl().rows);
    if (isNaN(rows)) {
      return 1;
    }
    return rows;
  }
}
