import { ViewType, ModelFieldType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { useMatched } from '@kunlun/router';
import { getModel } from '@kunlun/service';
import { getLabelFieldList4query, queryFieldDataList4Detail } from '@kunlun/engine';

import { FormFieldWidget, FormComplexFieldWidget } from '../../../../basic';
import UploadImgWidget from './UploadImgWidget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Detail],
    ttype: ModelFieldType.ManyToMany,
    widget: 'UploadImg'
  })
)
export class DetailM2MUploadImgFieldWidget extends FormComplexFieldWidget {
  public loadMetadata() {}

  public async fetchData() {
    const model = await getModel(this.field.references!);
    const labelModelFields = getLabelFieldList4query(this.dslNode!.optionLabel, model.labelFields!, model.modelFields);
    const list = await queryFieldDataList4Detail(
      this.field,
      this.fieldElement,
      labelModelFields,
      this.getSelfViewWidget()!.getDsl(),
      this.formData,
      [this.formData],
      this.rootData,
      useMatched().matched.segmentParams.page.scene
    );
    this.formData[this.field.name] = list;
    return this.formData[this.field.name];
  }

  public initialize(props) {
    super.initialize(props);
    this.createWidget(UploadImgWidget);
    return this;
  }
}
