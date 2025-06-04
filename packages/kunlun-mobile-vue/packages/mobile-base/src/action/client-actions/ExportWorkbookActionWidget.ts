import {
  ActiveRecord,
  buildQueryCondition,
  resolveDynamicExpression,
  RuntimeContext,
  RuntimeContextManager,
  RuntimeServerAction,
  SubmitValue
} from '@oinone/kunlun-engine';
import { ModelDefaultActionName, ViewType } from '@oinone/kunlun-meta';
import { Condition, getSessionPath } from '@oinone/kunlun-request';
import { DEFAULT_TRUE_CONDITION } from '@oinone/kunlun-service';
import { ReturnPromise } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { OioNotification } from '@oinone/kunlun-vue-ui-mobile-vant';
import { Widget } from '@oinone/kunlun-vue-widget';
import { isString } from 'lodash-es';
import { QueryExpression } from '../../basic';
import { ExcelExportService } from '../../service';
import { ClickResult } from '../../typing';
import { SearchView } from '../../view';
import { ActionWidget } from '../component';
import { ServerActionWidget } from '../server-actions';
import { DEFAULT_WORKBOOK_DEFINITION_ID_EXPRESSION } from './constant';

@SPI.ClassFactory(ActionWidget.Token({ name: ModelDefaultActionName.$$internal_ExportWorkbook }))
export class ExportWorkbookActionWidget extends ServerActionWidget {
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

  protected getWorkbookId(): ReturnPromise<string | undefined> {
    return this.executeExpression<string>(this.getDsl().workbookId || DEFAULT_WORKBOOK_DEFINITION_ID_EXPRESSION);
  }

  protected async executeAction(action: RuntimeServerAction, parameters: SubmitValue): Promise<ClickResult> {
    const workbookId = await this.getWorkbookId();
    if (!workbookId) {
      return false;
    }
    let condition: Condition | string | undefined;
    let runtimeContext: RuntimeContext | undefined;
    const activeRecords = this.openerActiveRecords;
    if (activeRecords && activeRecords.length) {
      condition = `id =in= (${activeRecords.map((a) => a.id).join(',')})`;
    } else {
      const res = this.buildSearchConditions();
      if (res) {
        condition = res.condition;
        runtimeContext = res.runtimeContext;
      }
    }
    if (!condition) {
      condition = DEFAULT_TRUE_CONDITION;
    }
    if (!runtimeContext) {
      runtimeContext = this.seekSearchRuntimeContext() || this.rootRuntimeContext;
    }
    const data = await ExcelExportService.createExportTask(this.model, workbookId, condition, {
      requestFields: runtimeContext.getRequestModelFields(),
      variables: {
        path: this.getSessionPath()
      }
    });
    if (data.id) {
      OioNotification.success(this.translate('kunlun.common.success'));
      return true;
    }
    OioNotification.error(this.translate('kunlun.common.error'));
    return false;
  }

  protected seekSearchRuntimeContext(): RuntimeContext | undefined {
    const parentHandle = this.metadataRuntimeContext.parentContext?.handle;
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
    const parentHandle = this.metadataRuntimeContext.parentContext?.handle;
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

  protected getSessionPath() {
    return this.action.sessionPath || this.viewAction?.sessionPath || getSessionPath();
  }
}
