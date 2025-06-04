import { ActiveRecord, translateValueByKey } from '@oinone/kunlun-engine';
import { ActionType, ViewActionTarget } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { OioMessage } from '@oinone/kunlun-vue-ui-antd';
import { ActionWidget } from '../../component';
import { InnerViewActionWidget } from '../popup';
import { loadBizRecord } from './service';

@SPI.ClassFactory(
  ActionWidget.Token({
    actionType: ActionType.View,
    target: ViewActionTarget.Inner,
    name: 'BizAuditRecordViewAction'
  })
)
export class BizAuditRecordViewAction extends InnerViewActionWidget {
  protected isRendRecordWidget = false;

  protected isFetchData(records: ActiveRecord[]): boolean | undefined {
    return false;
  }

  protected async loadData() {
    const { data } = await super.loadData();
    if (!data[0]?.id) {
      OioMessage.error(translateValueByKey('业务数据id不存在'));
    }
    return {
      data: (await loadBizRecord(data[0]?.id, this.model.model)) as unknown as ActiveRecord[],
      isFetchData: false
    };
  }
}
