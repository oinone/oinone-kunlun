import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../../basic';
import { FormM2OSelectTableFieldWidget } from '../../m2o';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.OneToOne,
    widget: 'SelectTable'
  })
)
export class FormO2OSelectTableFieldWidget extends FormM2OSelectTableFieldWidget {
  @Widget.Reactive()
  @Widget.Provide()
  protected get domainO2o() {
    const domain = this.domain;
    const essentialCondition = [] as string[];
    if (this.field.relationFields.length) {
      for (const rel of this.field.relationFields) {
        const single = `${rel} == null`;
        essentialCondition.push(single);
      }
    }
    let essentialConditionStr = '';
    if (essentialCondition.length) {
      essentialConditionStr = `${essentialCondition.join(' and ')}`;
    }
    if (domain === 'null' || !domain) {
      return essentialConditionStr;
    }
    return `${domain} and ${essentialConditionStr}`;
  }
}
