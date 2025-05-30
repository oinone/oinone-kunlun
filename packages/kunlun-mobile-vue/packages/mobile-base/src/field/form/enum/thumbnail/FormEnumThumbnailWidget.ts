import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { isNil } from 'lodash-es';
import { FormFieldWidget } from '../../../../basic';
import { FormEnumFieldAbstractWidget } from '../FormEnumFieldAbstractWidget';
import FormEnumThumbnail from './FormEnumThumbnail.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Detail],
    ttype: ModelFieldType.Enum,
    widget: 'Thumbnail',
    multi: false
  })
)
export class FormEnumThumbnailWidget extends FormEnumFieldAbstractWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(FormEnumThumbnail);
    return this;
  }

  @Widget.Reactive()
  protected get allowClear() {
    const { allowClear } = this.getDsl();
    if (isNil(allowClear)) {
      return false;
    }
    return allowClear;
  }

  @Widget.Reactive()
  public get isLink() {
    return false;
  }

  @Widget.Reactive()
  public get showAllowClear() {
    return false;
  }
}
