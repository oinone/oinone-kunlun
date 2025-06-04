import { ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { WidgetComponent } from '@oinone/kunlun-vue-widget';
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
