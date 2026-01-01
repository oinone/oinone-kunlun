import { type ActiveRecord, SubmitRelationHandler, SubmitValue } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { debounce } from 'lodash-es';
import { FormFieldWidget, SelectTableFieldWidget } from '../../../../basic';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.ManyToOne,
    widget: 'SelectTable'
  })
)
export class FormM2OSelectTableFieldWidget extends SelectTableFieldWidget<ActiveRecord> {
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

  @Widget.Watch('formData', { deep: true })
  public async watchM2OValue() {
    this.delayUpdateM2oValue();
  }

  public delayUpdateM2oValue = debounce(() => {
    this.updateM2oValue();
  });
}
