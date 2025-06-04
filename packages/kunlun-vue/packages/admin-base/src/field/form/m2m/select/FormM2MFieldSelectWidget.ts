import { ActiveRecord, RuntimeM2MField, SubmitHandler, SubmitValue } from '@oinone/kunlun-engine';
import { deepClone, ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget, FormSelectComplexFieldWidget } from '../../../../basic';
import SelectWidget from './SelectWidget.vue';
import { isEmpty } from 'lodash-es';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.ManyToMany
  })
)
export class FormM2MFieldSelectWidget extends FormSelectComplexFieldWidget<ActiveRecord[], RuntimeM2MField> {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(SelectWidget);
    return this;
  }

  @Widget.Method()
  public change(value) {
    if (value == null) {
      super.change(value);
      this.handleEmpty();
    } else {
      if (!value.length) {
        this.handleEmpty();
      }
      // focus的时候才会查询数据，这时候dataList为空，如果开始有value，会导致剩下的已选数据匹配不到值
      const list = isEmpty(this.dataList) ? this.value || [] : this.dataList;
      const submitData = value
        .map((item) => {
          return (list as any[])?.find((d) => d[this.relationFieldKey] === item.value);
        })
        .filter((a) => !!a);
      super.change(submitData);
    }
  }

  protected async fillOptions(dataList: Record<string, unknown>[], insetDefaultValue = true) {
    await super.fillOptionsForMulti(dataList);
  }

  public async submit(submitValue: SubmitValue) {
    const { field, itemName, value } = this;
    return SubmitHandler.M2M(field, itemName, submitValue, value);
  }

  protected async mounted() {
    await super.mounted();
    await this.loadOriginValue();
  }
}
