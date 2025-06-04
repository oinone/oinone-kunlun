import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { CastHelper } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget, FormSelectComplexFieldWidget } from '../../../../basic';
import SelectWidget from './SelectWidget.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.OneToMany,
    widget: 'Select'
  })
)
export class FormO2MFieldSelectWidget extends FormSelectComplexFieldWidget {
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
      const submitData = value.map((item) => {
        return this.dataList.find((d) => d[this.relationFieldKey] === item.value);
      });
      super.change(CastHelper.cast(submitData));
    }
  }

  protected async fillOptions(dataList: Record<string, unknown>[], insetDefaultValue = true) {
    await super.fillOptionsForMulti(dataList);
  }

  @Widget.Reactive()
  public get isLink() {
    return true;
  }

  @Widget.Reactive()
  public get fieldValueOverflowHidden() {
    return true;
  }

  protected async mounted() {
    await super.mounted();
    await this.loadOriginValue();
  }
}
