import { ActiveRecord, RuntimeO2OField, SubmitRelationHandler, SubmitValue } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { FormFieldWidget, ModalSelectFieldWidget } from '../../../../basic';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.OneToOne,
    widget: ['ModalSelect', 'SelectModal']
  })
)
export class FormO2OModalSelectFieldWidget extends ModalSelectFieldWidget<ActiveRecord, ActiveRecord, RuntimeO2OField> {
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
