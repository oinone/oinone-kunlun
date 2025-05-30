import { ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { WidgetComponent } from '@kunlun/vue-widget';
import { EditorFieldWidget } from '../../../../../basic';
import { FormYearRangeFieldWidget } from '../../../../form';
import DefaultEditorYearRangePicker from './DefaultEditorYearRangePicker.vue';

@SPI.ClassFactory(
  EditorFieldWidget.Token({
    viewType: ViewType.Table,
    widget: 'YearRangePicker'
  })
)
export class TableEditorYearRangeFieldWidget extends FormYearRangeFieldWidget {
  protected getInitializeComponent(): WidgetComponent {
    return DefaultEditorYearRangePicker;
  }
}
