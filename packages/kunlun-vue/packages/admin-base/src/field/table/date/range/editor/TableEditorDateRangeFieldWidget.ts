import { ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { WidgetComponent } from '@oinone/kunlun-vue-widget';
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
