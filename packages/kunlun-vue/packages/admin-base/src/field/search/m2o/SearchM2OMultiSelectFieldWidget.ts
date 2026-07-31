import { ActiveRecord, SubmitHandler, SubmitValue } from '@oinone/kunlun-engine';
import { isEmptyValue, ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../basic';
import { FormM2MSelectFieldWidget } from '../../form';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Search,
    ttype: ModelFieldType.ManyToOne,
    widget: 'MultiSelect'
  })
)
export class SearchM2OMultiSelectFieldWidget extends FormM2MSelectFieldWidget {
  public async submit(submitValue: SubmitValue) {
    const { field, itemName, value } = this;
    return SubmitHandler.O2M(field, itemName, submitValue, value);
  }

  protected async fillOptions(dataList: Record<string, unknown>[], insetDefaultValue = true) {
    this.fillOptionsForMulti(dataList);
  }

  @Widget.Watch('value', { deep: true })
  protected watchValue() {
    this.selectedValues = this.value as ActiveRecord[];
    if (!isEmptyValue(this.value)) {
      this.fillOptions(this.dataList || []);
    } else {
      if (this.oldDomain && this.oldDomain !== this.domain) {
        // 解决其他字段联动后当前字段domain发生了改变，且配置了clearFields清空了当前字段value的时候，之前已选中的对象还在options的问题
        // 之前watch domain 属性是没有用的，domain发生改变的时候value还是老的数据，所以需要在domain和value同时明确发生改变后重新获取一次options
        this.currentPage = 1;
        this.initLoadOptions();
        this.oldDomain = '';
      }
    }
  }
}
