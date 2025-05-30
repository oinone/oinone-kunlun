import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { ViewType } from '@kunlun/meta';
import { CustomWidget, BaseElementWidget } from '../../../basic';
import { queryAuditDetail } from './service';
import BizAuditRecordDetail from './BizAuditRecordDetail.vue';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    viewType: ViewType.Detail,
    widget: 'BizAuditRecordDetail'
  })
)
export class BizAuditRecordDetailWidget extends CustomWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(BizAuditRecordDetail);
    return this;
  }

  @Widget.Reactive()
  private data: Record<string, unknown>[] = [];

  protected async mountedProcess(): Promise<void> {
    const id = this.initialValue?.[0].id;
    const dataSource = await queryAuditDetail(id as string);
    this.data = dataSource as any;
  }
}
