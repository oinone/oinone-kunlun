import { ActiveRecord, RuntimeM2MField, SubmitRelationHandler, SubmitValue } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { SelectMode } from '@oinone/kunlun-vue-ui-common';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../../basic';
import { FormCascaderFieldWidget } from '../../../cascader';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Form,
    ttype: ModelFieldType.ManyToMany,
    widget: 'Cascader'
  })
)
export class FormM2MCascaderFieldWidget extends FormCascaderFieldWidget<ActiveRecord[], RuntimeM2MField> {
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
