import { ActiveRecord, RuntimeO2OField, SubmitRelationHandler, SubmitValue } from '@kunlun/engine';
import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { FormFieldWidget } from '../../../../basic';
import { FormTreeSelectFieldWidget } from '../../../tree-select';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Form,
    ttype: ModelFieldType.OneToOne,
    widget: 'TreeSelect'
  })
)
export class FormO2OTreeSelectFieldWidget extends FormTreeSelectFieldWidget<ActiveRecord, RuntimeO2OField> {
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
