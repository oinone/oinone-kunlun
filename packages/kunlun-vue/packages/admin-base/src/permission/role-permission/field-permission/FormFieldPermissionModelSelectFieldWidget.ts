import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { WidgetTrigger } from '@kunlun/vue-ui-common';
import { FormFieldWidget } from '../../../basic';
import { FormM2OTableFieldWidget } from '../../../field';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Form,
    ttype: ModelFieldType.ManyToOne,
    widget: 'field-permission-model-select'
  })
)
export class FormFieldPermissionModelSelectFieldWidget extends FormM2OTableFieldWidget {
  public async afterTriggerExecute(trigger: WidgetTrigger) {
    return await this.load(async () => await super.afterTriggerExecute(trigger));
  }
}
