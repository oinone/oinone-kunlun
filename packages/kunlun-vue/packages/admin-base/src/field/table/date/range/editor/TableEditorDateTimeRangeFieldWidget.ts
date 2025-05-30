import { ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { WidgetComponent } from '@kunlun/vue-widget';
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
