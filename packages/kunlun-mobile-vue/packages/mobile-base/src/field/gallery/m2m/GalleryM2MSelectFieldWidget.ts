import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';

import { FormFieldWidget } from '../../../basic/field';
import { GalleryO2MSelectFieldWidget } from '../o2m';
import { Widget } from '@oinone/kunlun-vue-widget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Gallery],
    ttype: ModelFieldType.ManyToMany
  })
)
export class GalleryM2MSelectFieldWidget extends GalleryO2MSelectFieldWidget {
  public loadMetadata() {}

  public async fetchData() {
    // const model = await getModel(this.field.references);
    // const labelModelFields = getLabelFieldList4query(this.getDsl().optionLabel, model.labelFields!, model.modelFields);
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
  protected get justifyContent() {
    return this.getDsl().justifyContent;
  }
}
