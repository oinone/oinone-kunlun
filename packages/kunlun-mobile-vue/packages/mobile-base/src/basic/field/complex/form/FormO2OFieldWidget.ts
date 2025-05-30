import { RuntimeO2OField, SubmitRelationHandler, SubmitValue } from '@kunlun/engine';
import { FormComplexObjectFieldWidget } from '../FormComplexObjectFieldWidget';

export abstract class FormO2OFieldWidget extends FormComplexObjectFieldWidget<RuntimeO2OField> {
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
