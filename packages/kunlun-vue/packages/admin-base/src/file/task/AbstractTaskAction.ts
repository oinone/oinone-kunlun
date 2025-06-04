import {
  buildQueryCondition,
  resolveDynamicDomain,
  resolveDynamicExpression,
  RuntimeContext,
  RuntimeContextManager
} from '@oinone/kunlun-engine';
import { ViewType } from '@oinone/kunlun-meta';
import { Condition, getSessionPath } from '@oinone/kunlun-request';
import { UrlHelper } from '@oinone/kunlun-shared';
import { OioNotification } from '@oinone/kunlun-vue-ui-antd';
import { Widget } from '@oinone/kunlun-vue-widget';
import { isString } from 'lodash-es';
import { ServerActionWidget } from '../../action';
import { BaseView } from '../../basic';

export abstract class AbstractTaskAction<T> extends ServerActionWidget {
  protected abstract get moduleName(): string;

  protected abstract get sync(): boolean;

  protected abstract generatorGQLByTask(task: T, condition: string | Condition): Promise<string>;

  protected abstract createTask(
    searchRuntimeContext: RuntimeContext,
    task: T,
    condition: string | Condition
  ): Promise<T>;

  protected async doTask(searchRuntimeContext: RuntimeContext, task: T, condition: Condition | string) {
    let data;
    let responseResult: boolean;
    if (this.sync) {
      data = await this.generatorGQLByTask(task, condition);
      const variables = {
        path: this.getSessionPath()
      };
      window.open(
        UrlHelper.appendBasePath(
          `/pamirs/${this.moduleName}?query=${encodeURIComponent(data)}&variables=${encodeURIComponent(
            JSON.stringify(variables)
          )}`
        ),
        '_blank'
      );
      responseResult = true;
    } else {
      data = await this.createTask(searchRuntimeContext, task, condition);
      responseResult = !!data.id;
    }
    return this.processResponseResult(searchRuntimeContext, task, responseResult);
  }

  protected processResponseResult(searchRuntimeContext: RuntimeContext, task: T, responseResult: boolean): boolean {
    if (responseResult) {
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

  protected executeSearchExpression(searchWidget: BaseView, expression: string): string | undefined {
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
      const searchWidget = Widget.select(searchRuntimeContext.handle) as unknown as BaseView;
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

    let filter = this.viewFilter;
    if (filter) {
      const { activeRecords, rootData, openerActiveRecords, scene, parentViewActiveRecords } = this;
      filter = resolveDynamicDomain(
        filter,
        activeRecords?.[0] || {},
        rootData?.[0] || {},
        openerActiveRecords?.[0] || {},
        scene,
        parentViewActiveRecords?.[0] || {}
      );
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
