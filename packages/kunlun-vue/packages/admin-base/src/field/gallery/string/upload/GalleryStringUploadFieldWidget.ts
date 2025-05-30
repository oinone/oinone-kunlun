import { ModelFieldType, ViewType } from '@kunlun/meta';
import { BooleanHelper } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { FormFieldWidget } from '../../../../basic';
import { DetailStringUploadFieldWidget } from '../../../detail';
import ReadonlyUpload from './ReadonlyUpload.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Gallery,
    ttype: [ModelFieldType.String, ModelFieldType.Text],
    widget: 'Upload'
  })
)
export class GalleryStringUploadFieldWidget extends DetailStringUploadFieldWidget {
  public initialize(config) {
    super.initialize(config);
    this.setComponent(ReadonlyUpload);
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

/**
 * @deprecated please using GalleryStringUploadFieldWidget
 */
export const GalleryUploadStringFieldWidget = GalleryStringUploadFieldWidget;
