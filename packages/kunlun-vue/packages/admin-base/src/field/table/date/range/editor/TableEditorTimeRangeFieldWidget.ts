import { ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { WidgetComponent } from '@kunlun/vue-widget';
import { EditorFieldWidget } from '../../../../../basic';
import { FormTimeRangeFieldWidget } from '../../../../form';
import DefaultEditorTimeRangePicker from './DefaultEditorTimeRangePicker.vue';

@SPI.ClassFactory(
  EditorFieldWidget.Token({
    viewType: ViewType.Table,
    widget: 'TimeRangePicker'
  })
)
export class TableEditorTimeRangeFieldWidget extends FormTimeRangeFieldWidget {
  protected getInitializeComponent(): WidgetComponent {
    return DefaultEditorTimeRangePicker;
  }
}
