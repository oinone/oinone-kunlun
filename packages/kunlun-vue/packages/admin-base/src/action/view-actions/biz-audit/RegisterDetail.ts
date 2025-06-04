import { ViewType } from '@oinone/kunlun-meta';
import { LayoutManager } from '../../../spi';

export const install = () => {
  LayoutManager.register(
    {
      viewType: ViewType.Detail,
      viewName: '应用日志listDetail',
      model: 'data.audit.OperationLog'
    },
    `<view type="DETAIL" width="large" footerInvisible="true">
        <custom widget="BizAuditRecordDetailList" slotSupport="field">
        </custom>
    </view>`
  );
  LayoutManager.register(
    {
      viewType: ViewType.Detail,
      viewName: '应用日志listDetail',
      model: 'data.audit.DataAuditAppLog'
    },
    `<view type="DETAIL" width="large" footerInvisible="true">
        <custom widget="BizAuditRecordDetailList" slotSupport="field">
        </custom>
    </view>`
  );
  LayoutManager.register(
    {
      viewType: ViewType.Detail,
      actionWidget: 'dataAuditAppLogListDetail',
      model: 'data.audit.DataAuditAppLog'
    },
    `<view type="DETAIL" width="medium">
        <custom widget="BizAuditRecordDetail" slotSupport="field" slot="fields">
        </custom>
    </view>`
  );
};
install();
