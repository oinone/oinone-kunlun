import { executeViewAction, Popup, RuntimeViewAction } from '@kunlun/engine';
import { ActionContextType, ActionType, isEmptyKeObject, ViewActionTarget, ViewType } from '@kunlun/meta';
import { Matched, Router } from '@kunlun/router';
import { getModel } from '@kunlun/service';
import { debugConsole, StringHelper } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { parseActionDomain4search } from '../../layout';
import { UrlQueryParameters } from '../../basic';
import { ActionWidget } from '../component';
import { ViewActionWidget } from './ViewActionWidget';

@SPI.ClassFactory(ActionWidget.Token({ actionType: [ActionType.View], target: [ViewActionTarget.Router] }))
export class RouterViewActionWidget extends ViewActionWidget {
  public get router(): Router | undefined {
    return this.$router;
  }

  public set router(router: Router | undefined) {
    this.$router = router;
  }

  public get matched(): Matched | undefined {
    return this.$matched;
  }

  public set matched(matched: Matched | undefined) {
    this.$matched = matched;
  }

  public initialize(config) {
    super.initialize(config);
    return this;
  }

  protected async clickAction() {
    const { $router, $matched, action } = this;
    if (!$router || !$matched) {
      return;
    }
    /**
     * 如果当前action是弹窗里面嵌入视图（o2m/m2m）里面的行内动作，执行该action的时候，是跳转路由，但是弹窗不会关闭
     * 所有要主动关闭弹窗
     */
    Popup.disposeAll();
    debugConsole.group(`routerViewAction click:${action.model}:${action.name}:${action.label}`);

    const parameters: UrlQueryParameters = {};
    const { resViewType, contextType } = action;
    let isListView = false;
    if (resViewType) {
      isListView = [ViewType.Table, ViewType.Gallery, ViewType.Tree].includes(resViewType);
    }
    if (isListView) {
      parameters.id = null;
      parameters.ids = null;
      const domain = this.actionDomain;
      if (domain) {
        const { searchBody, searchConditions } = parseActionDomain4search(await getModel(action.model), domain);
        debugConsole.log('search', { domain, searchBody, searchConditions });
        if (!isEmptyKeObject(searchBody)) {
          parameters.searchBody = encodeURIComponent(JSON.stringify(searchBody));
        }
        if (!isEmptyKeObject(searchConditions)) {
          parameters.searchConditions = encodeURIComponent(JSON.stringify(searchConditions));
        }
      } else {
        parameters.searchBody = null;
        parameters.searchConditions = null;
      }
    } else {
      parameters.searchBody = null;
      parameters.searchConditions = null;
      switch (contextType) {
        case ActionContextType.Single:
          parameters.id = this.activeRecords?.[0].id as string | undefined;
          parameters.ids = null;
          debugConsole.log('id', parameters.id);
          break;
        case ActionContextType.SingleAndBatch:
        case ActionContextType.Batch:
          parameters.id = null;
          parameters.ids = this.activeRecords
            ?.map((v) => v.id as string | undefined)
            .filter((v) => !!v)
            .join(StringHelper.ARRAY_DEFAULT_SEPARATOR);
          debugConsole.log('ids', parameters.ids);
          break;
        case ActionContextType.ContextFree:
          parameters.id = null;
          parameters.ids = null;
          break;
      }
    }
    const context = this.buildContext();
    if (context && Object.keys(context).length) {
      parameters.context = JSON.stringify(context);
    } else {
      parameters.context = null;
    }
    this.realExecuteAction(action, parameters);
    debugConsole.groupEnd();
  }

  protected realExecuteAction(action: RuntimeViewAction, parameters: UrlQueryParameters) {
    executeViewAction(action, this.$router, this.$matched, parameters);
  }
}
