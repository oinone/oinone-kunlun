import { ActiveRecord, RuntimeM2MField, SubmitRelationHandler, SubmitValue } from '@kunlun/engine';
import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { SelectMode } from '@kunlun/vue-ui-common';
import { Widget } from '@kunlun/vue-widget';
import { FormFieldWidget } from '../../../../basic';
import { FormTreeSelectFieldWidget } from '../../../tree-select';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Form,
    ttype: ModelFieldType.ManyToMany,
    widget: 'TreeSelect'
  })
)
export class FormM2MTreeSelectFieldWidget extends FormTreeSelectFieldWidget<ActiveRecord[], RuntimeM2MField> {
  @Widget.Reactive()
  protected get selectMode(): SelectMode {
    return SelectMode.multiple;
  }

  public async submit(submitValue: SubmitValue) {
    const { field, itemName, value, viewMode, submitCache, submitType, relationUpdateType } = this;
    return SubmitRelationHandler.M2M(
      field,
      itemName,
      submitValue,
      value,
      viewMode,
      submitCache,
      submitType,
      relationUpdateType
    );
  }
}
