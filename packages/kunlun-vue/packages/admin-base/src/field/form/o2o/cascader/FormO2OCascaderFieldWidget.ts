import { ActiveRecord, RuntimeO2OField, SubmitRelationHandler, SubmitValue } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { FormFieldWidget } from '../../../../basic';
import { FormCascaderFieldWidget } from '../../../cascader';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Form,
    ttype: ModelFieldType.OneToOne,
    widget: 'Cascader'
  })
)
export class FormO2OCascaderFieldWidget extends FormCascaderFieldWidget<ActiveRecord, RuntimeO2OField> {
  public async submit(submitValue: SubmitValue) {
    const { field, itemName, value, viewMode, submitCache, submitType, relationUpdateType } = this;
    return SubmitRelationHandler.O2O(
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
