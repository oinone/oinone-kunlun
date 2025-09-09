import { SubmitRelationHandler, SubmitValue } from '@oinone/kunlun-engine';
import { AbstractFormM2OUploadFieldWidget } from '../../m2o';

export class AbstractFormO2OUploadFieldWidget extends AbstractFormM2OUploadFieldWidget {
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
