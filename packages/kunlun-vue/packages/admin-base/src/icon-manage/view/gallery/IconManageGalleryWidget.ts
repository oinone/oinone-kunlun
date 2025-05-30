import { translateValueByKey } from '@kunlun/engine';
import { ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { BaseElementListViewWidget, BaseElementWidget } from '../../../basic';
import { UploadStatus } from '../../typing';
import IconManageGallery from './IconManageGallery.vue';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    viewType: ViewType.Gallery,
    widget: 'IconManageGallery'
  })
)
export class IconManageGalleryWidget extends BaseElementListViewWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(IconManageGallery);
    return this;
  }

  @Widget.Reactive()
  public uploadStatus: UploadStatus = UploadStatus.NoData;

  public setUploadStatus(status: UploadStatus) {
    this.uploadStatus = status;
  }

  /**
   * 空数据提示
   */
  @Widget.Reactive()
  protected get emptyText() {
    return this.getDsl().emptyText || translateValueByKey('暂无数据');
  }

  /**
   * 空数据图片
   */
  @Widget.Reactive()
  protected get emptyImage() {
    return this.getDsl().emptyImage || undefined;
  }
}
