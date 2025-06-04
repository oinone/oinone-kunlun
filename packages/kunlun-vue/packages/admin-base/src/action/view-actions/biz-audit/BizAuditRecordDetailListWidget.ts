import { RuntimeContextManager, ViewCache } from '@oinone/kunlun-engine';
import { ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { BaseElementWidget } from '../../../basic';
import { createRuntimeContextForWidget } from '../../../tags';
import { DetailWidget } from '../../../view';
import BizAuditRecordDetailList from './BizAuditRecordDetailList.vue';
import { BizAuditRecordCommonDetailName, BizAuditRecordModel } from './service';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    viewType: ViewType.Detail,
    widget: 'BizAuditRecordDetailList'
  })
)
export class BizAuditRecordDetailListWidget extends DetailWidget {
  public commonDetailWidgetList: DetailWidget[] = [];

  public initialize(props) {
    super.initialize(props);
    this.setComponent(BizAuditRecordDetailList);
    return this;
  }

  // @Widget.Watch('dataSource')
  public async watchBizAuditRecordDataSource(val) {
    this.disposeDetailWidgets(this.commonDetailWidgetList);
    this.commonDetailWidgetList = [];
    if (val) {
      const resView = await ViewCache.get(BizAuditRecordModel, BizAuditRecordCommonDetailName);
      const runtimeContext = createRuntimeContextForWidget(resView!);
      const runtimeContextHandle = runtimeContext.handle;
      for (const record of val) {
        const detailWidget = this.createWidget(DetailWidget, record.id, {
          metadataHandle: runtimeContextHandle,
          rootHandle: runtimeContextHandle,
          template: runtimeContext.viewTemplate,
          internal: true,
          inline: true,
          dataSource: record,
          activeRecords: record
        });
        this.commonDetailWidgetList.push(detailWidget);
      }
    }
  }

  protected disposeDetailWidgets(widgets: DetailWidget[]) {
    widgets.forEach((nodeWidget) => {
      nodeWidget.dispose();
      RuntimeContextManager.delete(nodeWidget.metadataRuntimeContext?.handle);
    });
  }
}
