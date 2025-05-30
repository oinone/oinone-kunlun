import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { ConditionInputPanel } from '@kunlun/vue-expression';
import { RsqlConditionInputControlWidget } from './rsqlConditionInputControlWidget';
import { FormFieldWidget } from '../../../../../basic';

/**
 * rsql查询条件控件
 */
@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Form,
    ttype: [ModelFieldType.String, ModelFieldType.Text],
    widget: 'RsqlConditionPanel'
  })
)
export class RsqlConditionPanelWidget extends RsqlConditionInputControlWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(ConditionInputPanel);
    return this;
  }
}
