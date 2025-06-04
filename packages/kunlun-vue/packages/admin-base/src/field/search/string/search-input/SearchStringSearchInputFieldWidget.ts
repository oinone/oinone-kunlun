import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../../basic';
import { FormStringInputFieldWidget } from '../../../form';
import DefaultSearchInput from './DefaultSearchInput.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Search,
    ttype: ModelFieldType.String,
    widget: 'SearchInput'
  })
)
export class SearchStringSearchInputFieldWidget extends FormStringInputFieldWidget {
  @Widget.Method()
  @Widget.Inject()
  protected onSearch: (() => void) | undefined;

  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultSearchInput);
    return this;
  }
}

/**
 * @deprecated please using SearchStringSearchInputFieldWidget
 */
export const SearchInputStringFieldWidget = SearchStringSearchInputFieldWidget;
