import { ActiveRecord, SubmitRelationHandler, SubmitValue } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { debounce } from 'lodash-es';
import { FormFieldWidget, FormSelectModalComplexFieldWidget } from '../../../../basic';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.ManyToOne,
    widget: 'SelectModal'
  })
)
export class FormM2OSelectModalFieldWidget extends FormSelectModalComplexFieldWidget<ActiveRecord> {
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
    this.pageSize;
    this.delayUpdateM2oValue();
  }

  public delayUpdateM2oValue = debounce(() => {
    this.updateM2oValue();
  });
}
