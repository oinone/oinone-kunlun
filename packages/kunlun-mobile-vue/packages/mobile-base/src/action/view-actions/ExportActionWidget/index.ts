import {
  ActiveRecord,
  buildQueryCondition,
  resolveDynamicExpression,
  RuntimeContext,
  RuntimeContextManager,
  translateValueByKey
} from '@kunlun/engine';
import { ModelDefaultActionName, ViewType } from '@kunlun/meta';
import { Condition } from '@kunlun/request';
import { DEFAULT_TRUE_CONDITION } from '@kunlun/service';
import { SPI } from '@kunlun/spi';
import { createEasyExportTask, getExportWorkBook, OioNotification } from '@kunlun/vue-ui-mobile-vant';
import { Widget } from '@kunlun/vue-widget';
import { QueryExpression } from '../../../basic';
import { ValidatorStatus } from '../../../typing';
import { ActionWidget } from '../../component';
import ImportCom from './ExportActionWidget.vue';
import { SearchView } from '../../../view';
import { Expression, ExpressionRunParam } from '@kunlun/expression';
import { isString } from 'lodash-es';

@SPI.ClassFactory(ActionWidget.Token({ name: ModelDefaultActionName.$$internal_GotoListExportDialog }))
export class ExportActionWidget extends ActionWidget {
  /**
   * 搜索数据
   * @protected
   */
  @Widget.Reactive()
  @Widget.Inject()
  protected searchBody: ActiveRecord | undefined;

  /**
   * 搜索表达式
   * @protected
   */
  @Widget.Reactive()
  @Widget.Inject()
  protected searchConditions: QueryExpression[] | undefined;

  protected seekSearchRuntimeContext(): RuntimeContext | undefined {
    const parentHandle = this.metadataRuntimeContext?.handle;
    if (!parentHandle) {
      return undefined;
    }
    const searchRuntimeContext = RuntimeContextManager.getOthers(parentHandle).find(
      (v) => v.view?.type === ViewType.Search
    );
    if (searchRuntimeContext) {
      return searchRuntimeContext;
    }
  }

  protected seekParentMetadataRuntimeContext() {
    const parentHandle = this.metadataRuntimeContext.handle;
    if (!parentHandle) {
      return undefined;
    }
    const widget = Widget.select(parentHandle) as unknown as { metadataRuntimeContext: RuntimeContext | undefined };
    return widget.metadataRuntimeContext;
  }

  protected executeSearchExpression(searchWidget: SearchView, expression: string): string | undefined {
    return resolveDynamicExpression(
      expression,
      searchWidget?.activeRecords?.[0] || {},
      searchWidget?.rootData?.[0] || {},
      searchWidget?.openerActiveRecords?.[0] || {},
      searchWidget?.scene || ''
    );
  }

  protected buildSearchConditions(): { runtimeContext: RuntimeContext; condition: Condition } | undefined {
    let condition: Condition | undefined;

    // 搜索表达式
    const { searchBody, searchConditions } = this;
    const searchRuntimeContext = this.seekSearchRuntimeContext();
    if (searchRuntimeContext) {
      const searchWidget = Widget.select(searchRuntimeContext.handle) as unknown as SearchView;
      const realSearchBody = { ...searchBody };
      Object.keys(realSearchBody).forEach((key) => {
        const val = realSearchBody[key];
        if (isString(val)) {
          const expStr = val as unknown as string;
          realSearchBody[key] = this.executeSearchExpression(searchWidget, expStr);
        }
      });
      condition = buildQueryCondition(searchRuntimeContext, {}, realSearchBody || {}, searchConditions || []);
    }

    const filter = this.seekParentMetadataRuntimeContext()?.view?.filter;
    if (filter) {
      if (condition) {
        condition.and(new Condition(filter));
      } else {
        condition = new Condition(filter);
      }
    }

    if (condition) {
      return {
        runtimeContext: searchRuntimeContext || this.rootRuntimeContext,
        condition
      };
    }
  }

  public initialize(config) {
    super.initialize(config);
    this.setComponent(ImportCom);
    return this;
  }

  @Widget.Reactive()
  protected get label() {
    return this.getDsl().label || this.action?.displayName || translateValueByKey('导出');
  }

  protected file: { id?: string } = {};

  @Widget.Reactive()
  protected validation1: { status: ValidatorStatus; help: string } = {
    status: ValidatorStatus.Success,
    help: ''
  };

  @Widget.Reactive()
  protected validation2: { status: ValidatorStatus; help: string } = {
    status: ValidatorStatus.Success,
    help: ''
  };

  protected firstOpen = true;

  @Widget.Reactive()
  protected visible = false;

  @Widget.Reactive()
  protected selectValue = '';

  @Widget.Reactive()
  protected workbookList: any[] = [];

  @Widget.Reactive()
  protected handleSelectChange(val) {
    this.selectValue = val;
  }

  public clickAction() {
    this.change(true);
  }

  @Widget.Method()
  protected async createExportTask() {
    if (!this.selectValue) {
      this.validation1.status = ValidatorStatus.Error;
      this.validation1.help = this.translate('kunlun.export.tips');
      return;
    }
    let condition: Condition | string | undefined;
    const activeRecords = this.activeRecords;
    if (activeRecords && activeRecords.length) {
      condition = `id =in= (${activeRecords.map((a) => a.id).join(',')})`;
    } else {
      const res = this.buildSearchConditions();
      if (res) {
        condition = res.condition;
      }
    }
    if (!condition) {
      condition = DEFAULT_TRUE_CONDITION;
    }
    const data = await createEasyExportTask(this.selectValue, condition);
    if (data.id) {
      OioNotification.success(this.translate('kunlun.common.success'));
      this.change(false);
    } else {
      OioNotification.error(this.translate('kunlun.common.error'));
    }
  }

  @Widget.Method()
  protected async change(val) {
    if (this.firstOpen && val) {
      this.firstOpen = false;
      this.queryWorkbookList();
    }
    this.visible = val;
  }

  protected async queryWorkbookList() {
    const model = this.model.model;
    if (model) {
      this.workbookList = (await getExportWorkBook(model, true)) as any[];
    }
  }
}
