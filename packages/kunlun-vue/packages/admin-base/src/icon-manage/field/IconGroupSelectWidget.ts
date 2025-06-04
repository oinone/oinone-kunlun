import { translateValueByKey } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { debounce } from 'lodash-es';
import { FormFieldWidget } from '../../basic';
import { SearchM2OSelectFieldWidget } from '../../field';
import { IconGroup } from '../service/IconManageService';
import { GroupAll } from '../typing';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Search,
    ttype: ModelFieldType.ManyToOne,
    widget: 'IconGroupSelectWidget'
  })
)
export class IconGroupSelectWidget extends SearchM2OSelectFieldWidget {
  public initialize(props) {
    super.initialize(props);
    return this;
  }

  public delayUpdateM2oValue = debounce(() => {
    const val = this.getValue();
    if (val) {
      this.parentOnChangeWidgetGroup?.({ id: String(val.value || val.id), name: String(val.label || val.name) }, true);
    } else {
      GroupAll.name = translateValueByKey(GroupAll.name);
      this.parentOnChangeWidgetGroup?.(GroupAll, true);
    }
    this.updateM2oValue();
  });

  @Widget.Inject('onChangeWidgetGroup')
  protected parentOnChangeWidgetGroup: ((val: IconGroup, notChange: boolean) => void) | undefined;

  @Widget.Method()
  public change(value) {
    if (value == undefined) {
      GroupAll.name = translateValueByKey(GroupAll.name);
      this.parentOnChangeWidgetGroup?.(GroupAll, true);
    } else {
      this.parentOnChangeWidgetGroup?.({ id: value.value || value.id, name: value.label || value.name }, true);
    }
    super.change(value);
  }
}
