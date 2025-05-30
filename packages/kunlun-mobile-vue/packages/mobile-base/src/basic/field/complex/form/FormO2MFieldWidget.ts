import { RuntimeO2MField, SubmitRelationHandler, SubmitValue } from '@kunlun/engine';
import { FormComplexListFieldWidget } from '../FormComplexListFieldWidget';

export class FormO2MFieldWidget extends FormComplexListFieldWidget<RuntimeO2MField> {
  public async submit(submitValue: SubmitValue) {
    const { field, itemName, value, viewMode, submitCache, submitType, relationUpdateType } = this;
    return SubmitRelationHandler.O2M(
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
