import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../../basic';
import { FormM2OSelectFieldWidget } from '../../m2o/select/FormM2OSelectFieldWidget';

/**
 * o2o的默认组件实现select
 */
@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.OneToOne
  })
)
export class FormO2OSelectFieldWidget extends FormM2OSelectFieldWidget {
  /**
   * 目前o2o字段对方模型没有生成字段
   * @protected
   */
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
