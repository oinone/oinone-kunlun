import { SPI } from '@kunlun/spi';
import { ViewType } from '@kunlun/meta';
import { Widget } from '@kunlun/vue-widget';
import { FormFieldWidget } from '../../../basic';
import GalleryString from '../string/default/GalleryString.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Gallery,
    widget: 'ModelLabelWidget'
  })
)
export class ModelLabelWidget extends FormFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(GalleryString);
    return this;
  }

  @Widget.Reactive()
  public get currentValue() {
    const { label, labelFields = ['name'] } = this.model || {};
    if (label) {
      const str = this.executeExpression(label, '');
      return str?.replaceAll?.('undefined', '');
    }
    if (labelFields) {
      return labelFields.map((a) => this.formData[a] || '').join('-');
    }
    return '';
  }

  @Widget.Reactive()
  public get value(): any | undefined {
    return this.currentValue;
  }

  @Widget.Reactive()
  protected get justifyContent() {
    return this.getDsl().justifyContent;
  }
}
