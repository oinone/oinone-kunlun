import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { BooleanHelper } from '@oinone/kunlun-shared';

import { FormFieldWidget } from '../../../../basic/field';
import { DetailRelationSelectFieldWidget } from '../../abstract/DetailRelationSelectFieldWidget';
import DetailUpload from './DetailUpload.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Detail],
    ttype: ModelFieldType.ManyToOne,
    widget: 'Upload'
  })
)
export class DetailM2OUploadWidget extends DetailRelationSelectFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DetailUpload);
    return this;
  }

  @Widget.Reactive()
  protected get cdnKey() {
    return this.getDsl().cdnKey?.trim?.();
  }

  @Widget.Reactive()
  protected get privateLink() {
    return BooleanHelper.toBoolean(this.getDsl().privateLink);
  }
}
