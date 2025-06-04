import { ActiveRecords } from '@oinone/kunlun-engine';
import { ViewType } from '@oinone/kunlun-meta';
import { CallChaining } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { BaseListView, BaseView } from '../../basic';

/**
 * <h3>表格视图</h3>
 * <p>
 * 表格视图是对列表（List）数据类型综合定义。
 * 主要包含数据源、数据操作、选中行、分页、排序、搜索视图支持、特定搜索支持等常用功能。
 * </p>
 */
@SPI.ClassFactory(BaseView.Token({ type: ViewType.Table }))
export class TableView extends BaseListView {
  @Widget.Reactive()
  @Widget.Provide()
  protected editRowCallChaining: CallChaining<[string, ActiveRecords]> | undefined;

  protected $$beforeMount() {
    super.$$beforeMount();
    this.editRowCallChaining = new CallChaining<[string, ActiveRecords]>();
  }
}
