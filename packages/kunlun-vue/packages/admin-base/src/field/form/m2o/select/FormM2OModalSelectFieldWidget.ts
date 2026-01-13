import { ActiveRecord, RuntimeM2OField, SubmitRelationHandler, SubmitValue } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { FormFieldWidget, ModalSelectFieldWidget } from '../../../../basic';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.ManyToOne,
    widget: ['ModalSelect', 'SelectModal']
  })
)
export class FormM2OModalSelectFieldWidget extends ModalSelectFieldWidget<ActiveRecord, ActiveRecord, RuntimeM2OField> {
  public async submit(submitValue: SubmitValue) {
    const { field, itemName, value, viewMode, submitCache, submitType, relationUpdateType } = this;
    return SubmitRelationHandler.M2O(
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
