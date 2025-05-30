import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { SearchTrigger } from '@kunlun/vue-ui-common';
import { Widget } from '@kunlun/vue-widget';
import { FormFieldWidget } from '../../../basic';
import { FormM2OSelectFieldWidget } from '../../form';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Search,
    ttype: ModelFieldType.ManyToOne
  })
)
export class SearchM2OSelectFieldWidget extends FormM2OSelectFieldWidget {
  @Widget.Reactive()
  @Widget.Inject()
  protected onSearch: (() => void) | undefined;

  protected defaultSearchTrigger: SearchTrigger[] = [SearchTrigger.MANUAL];

  @Widget.Reactive()
  protected get searchTrigger(): SearchTrigger[] {
    const searchTrigger = (this.getDsl().searchTrigger as string)
      ?.split(',')
      ?.map((v) => v.trim().toLowerCase?.() as SearchTrigger);
    if (searchTrigger) {
      return searchTrigger;
    }
    return this.defaultSearchTrigger;
  }

  @Widget.Method()
  public change(value) {
    super.change(value);
    if (this.searchTrigger.includes(SearchTrigger.CHANGE)) {
      this.onSearch?.();
    }
  }
}
