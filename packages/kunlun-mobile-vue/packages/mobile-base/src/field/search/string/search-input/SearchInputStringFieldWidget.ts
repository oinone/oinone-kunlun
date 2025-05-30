import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { FormFieldWidget } from '../../../../basic';
import { FormStringFieldSingleWidget } from '../../../form';
import DefaultSearchInput from './DefaultSearchInput.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Search,
    ttype: ModelFieldType.String,
    widget: 'SearchInput'
  })
)
export class SearchInputStringFieldWidget extends FormStringFieldSingleWidget {
  @Widget.Method()
  @Widget.Inject()
  protected onSearch: (() => void) | undefined;

  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultSearchInput);
    return this;
  }
}
