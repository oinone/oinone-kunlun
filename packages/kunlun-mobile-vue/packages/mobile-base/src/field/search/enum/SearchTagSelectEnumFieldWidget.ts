import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../basic';
import { FormEnumFieldWidget } from '../../form';
import TagSelect from './TagSelect.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Search,
    ttype: [ModelFieldType.Enum],
    multi: false,
    widget: 'TagSelect'
  })
)
export class SearchTagSelectEnumFieldWidget extends FormEnumFieldWidget {
  @Widget.Reactive()
  @Widget.Inject()
  protected onSearch: (() => void) | undefined;

  public initialize(props) {
    super.initialize(props);
    this.setComponent(TagSelect);
    return this;
  }

  @Widget.Method()
  public change(value) {
    super.change(value);
    this.onSearch?.();
  }
}
