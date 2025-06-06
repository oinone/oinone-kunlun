import { ActiveRecord } from '@oinone/kunlun-engine';
import { CallChaining } from '@oinone/kunlun-shared';
import { SelectMode } from '@oinone/kunlun-vue-ui-common';
import { Widget } from '@oinone/kunlun-vue-widget';
import { BaseView, BaseViewProps } from '../token';
import { QueryExpression } from '../types';

export class BaseListView<T extends BaseViewProps = BaseViewProps> extends BaseView<T> {
  /**
   * 搜索表单数据
   * @protected
   */
  @Widget.Reactive()
  @Widget.Provide()
  protected searchBody: ActiveRecord | undefined;

  /**
   * 高级搜索条件表达式
   * @protected
   */
  @Widget.Reactive()
  @Widget.Provide()
  protected searchConditions: QueryExpression[] | undefined;

  @Widget.Reactive()
  @Widget.Provide()
  protected selectMode: SelectMode | undefined;

  @Widget.Reactive()
  @Widget.Provide()
  protected selectModeCallChaining: CallChaining | undefined;

  @Widget.Reactive()
  @Widget.Provide()
  protected checkboxAllCallChaining: CallChaining | undefined;

  @Widget.Method()
  @Widget.Provide()
  public flushSearchParameters(searchBody, searchConditions?): void {
    this.searchBody = searchBody;
    this.searchConditions = searchConditions;
  }

  protected $$beforeMount() {
    super.$$beforeMount();
    this.selectModeCallChaining = new CallChaining();
    this.checkboxAllCallChaining = new CallChaining();
  }

  protected $$mounted() {
    super.$$mounted();
    this.selectModeCallChaining?.hook(this.path, (args) => {
      this.selectMode = (args?.[0] as string)?.toLowerCase?.() as SelectMode;
    });
  }

  protected $$unmounted() {
    super.$$unmounted();
    this.selectModeCallChaining?.unhook(this.path);
  }
}
