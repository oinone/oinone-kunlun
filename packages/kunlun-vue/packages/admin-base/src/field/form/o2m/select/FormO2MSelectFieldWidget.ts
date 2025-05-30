import { ModelFieldType, ViewType } from '@kunlun/meta';
import { CastHelper } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { isEmpty } from 'lodash-es';
import { FormFieldWidget, FormSelectComplexFieldWidget } from '../../../../basic';
import SelectWidget from './SelectWidget.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.OneToMany
  })
)
export class FormO2MSelectFieldWidget extends FormSelectComplexFieldWidget {
  public async fetchData() {
    // const model = await getModel(this.field.references!);
    // const labelModelFields = getLabelFieldList4query(this.getDsl().optionLabel, model.labelFields!, model.modelFields);
    // const dataList = await queryFieldDataList4Form(
    //   this.field,
    //   this.fieldElement,
    //   labelModelFields,
    //   this.getSelfViewWidget()!.getDsl(),
    //   this.formData,
    //   [this.formData],
    //   this.rootData,
    //   useMatched().matched.segmentParams.page.scene
    // );
    // this.formData[this.field.name] = dataList;
    // if (!this.field.relationStore && dataList) {
    //   this.viewWidget?.loadData(dataList);
    //   return;
    // }
    // if (this.dataList.length > 0) {
    //   await this.fillOptions(this.dataList, true);
    // }
    // if (dataList && dataList.length > 0) {
    //   this.selectedValues = dataList;
    // }
  }

  public initialize(props) {
    super.initialize(props);
    this.setComponent(SelectWidget);
    return this;
  }

  @Widget.Method()
  public change(value: { value: string }[]) {
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
      super.change(CastHelper.cast(submitData));
    }
  }

  protected async fillOptions(dataList: Record<string, unknown>[], insetDefaultValue = true) {
    await super.fillOptionsForMulti(dataList);
  }

  protected async mounted() {
    await super.mounted();
    await this.loadOriginValue();
  }
}

/**
 * @deprecated please using FormO2MSelectFieldWidget
 */
export const FormO2MFieldSelectWidget = FormO2MSelectFieldWidget;
