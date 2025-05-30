import { ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { WidgetComponent } from '@kunlun/vue-widget';
import { EditorFieldWidget } from '../../../../../basic';
import { FormDateRangeFieldWidget } from '../../../../form';
import DefaultEditorDateRangePicker from './DefaultEditorDateRangePicker.vue';

@SPI.ClassFactory(
  EditorFieldWidget.Token({
    viewType: ViewType.Table,
    widget: 'DateRangePicker'
  })
)
export class TableEditorDateRangeFieldWidget extends FormDateRangeFieldWidget {
  protected getInitializeComponent(): WidgetComponent {
    return DefaultEditorDateRangePicker;
  }
}
