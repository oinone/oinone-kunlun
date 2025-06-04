import { ActiveRecord, getLabelFieldList4query, RuntimeO2MField } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../basic/field';
import { DetailRelationSelectFieldWidget } from '../abstract/DetailRelationSelectFieldWidget';
import Select from './Select.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Detail],
    ttype: ModelFieldType.OneToMany,
    widget: 'Select'
  })
)
export class DetailO2MSelectFieldWidget extends DetailRelationSelectFieldWidget<ActiveRecord[], RuntimeO2MField> {
  public loadMetadata() {}

  public async fetchData() {
    const labelModelFields = getLabelFieldList4query(
      this.getDsl().optionLabel || this.referencesModel?.label,
      this.referencesModel!.labelFields!,
      this.referencesModel!.modelFields!
    );
    // const list = await queryFieldDataList4Detail(
    //   this.field,
    //   this.fieldElement,
    //   labelModelFields,
    //   this.getSelfViewWidget()!.getDsl(),
    //   this.formData,
    //   [this.formData],
    //   this.rootData,
    //   useMatched().matched.segmentParams.page.scene
    // );
    this.formData[this.itemData] = [];
    return this.formData[this.itemData];
  }

  @Widget.Reactive()
  protected get currentValue() {
    const v = this.value || [];
    const rv = [] as any[];
    for (const vElement of v) {
      rv.push(this.handleTableLabel(vElement));
    }
    return rv;
  }

  public initialize(props) {
    super.initialize(props);
    this.setComponent(Select);
    return this;
  }

  @Widget.Reactive()
  public get fieldValueOverflowHidden() {
    return true;
  }

  @Widget.Reactive()
  public get isAutoHeight() {
    return true;
  }
}
