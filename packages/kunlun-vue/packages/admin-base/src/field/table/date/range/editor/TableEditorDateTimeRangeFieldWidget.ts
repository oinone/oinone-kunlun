import { ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { WidgetComponent } from '@oinone/kunlun-vue-widget';
import { EditorFieldWidget } from '../../../../../basic';
import { FormDateTimeRangeFieldWidget } from '../../../../form';
import DefaultEditorDateTimeRangePicker from './DefaultEditorDateTimeRangePicker.vue';

@SPI.ClassFactory(
  EditorFieldWidget.Token({
    viewType: ViewType.Table,
    widget: 'DateTimeRangePicker'
  })
)
export class TableEditorDateTimeRangeFieldWidget extends FormDateTimeRangeFieldWidget {
  protected getInitializeComponent(): WidgetComponent {
    return DefaultEditorDateTimeRangePicker;
  }
}
