import {
  CurrentLanguage,
  generatorViewActionQueryParameter,
  isRuntimeViewAction,
  RuntimeAction,
  RuntimeViewAction,
  translateValueByKey
} from '@kunlun/engine';
import { ActionType, ViewActionTarget } from '@kunlun/meta';
import { MessageHub } from '@kunlun/request';
import { useMatched } from '@kunlun/router';
import { ReturnPromise } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { ModuleService } from '@kunlun/vue-admin-layout';
import { Widget } from '@kunlun/vue-widget';
import { BaseActionWidget } from '../../../../basic';
import { PopupLoadDataResult } from '../typing';
import { DialogViewActionWidget } from './DialogViewActionWidget';

@SPI.ClassFactory(
  BaseActionWidget.Token({
    actionType: ActionType.View,
    target: ViewActionTarget.Dialog,
    name: 'SharedPageViewAction'
  })
)
export class SharedViewActionWidget extends DialogViewActionWidget {
  @Widget.Reactive()
  protected get sharedViewActionName() {
    return this.getDsl().sharedViewActionName;
  }

  protected loadData(): ReturnPromise<PopupLoadDataResult> {
    const { sharedViewActionName } = this;
    let title: string | undefined;
    let parameters: string | undefined;
    let shareActionModel: string | undefined;
    let shareActionName: string | undefined;
    if (sharedViewActionName) {
      const targetViewAction = this.rootRuntimeContext.model.modelActions.find((v) => v.name === sharedViewActionName);
      if (!this.isValidViewAction(targetViewAction)) {
        MessageHub.error(translateValueByKey('无效的跳转动作'));
        return {
          isFetchData: false,
          data: []
        };
      }
      const res = this.generatorUrlByViewAction(targetViewAction);
      shareActionModel = targetViewAction.model;
      shareActionName = targetViewAction.name;
      title = res.title;
      parameters = res.parameters;
    } else {
      const { matched } = useMatched();
      const page = matched.segmentParams?.page;
      if (!page) {
        MessageHub.error(translateValueByKey('无法获取链接参数'));
        return {
          isFetchData: false,
          data: []
        };
      }
      shareActionModel = this.action.model;
      shareActionName = this.action.name;
      title = document.title;
      parameters = JSON.stringify(page);
    }
    return {
      isFetchData: true,
      data: [
        {
          shareActionModel,
          shareActionName,
          parameters,
          browserTitle: title,
          language: CurrentLanguage.getCodeByLocalStorage(),
          languageIsoCode: CurrentLanguage.getIsoCodeByLocalStorage()
        }
      ]
    };
  }

  protected isValidViewAction(action: RuntimeAction | undefined): action is RuntimeViewAction {
    if (!action) {
      return false;
    }
    if (!isRuntimeViewAction(action)) {
      return false;
    }
    return !!action.target && [ViewActionTarget.Router, ViewActionTarget.OpenWindow].includes(action.target);
  }

  protected generatorUrlByViewAction(viewAction: RuntimeViewAction): {
    title: string;
    parameters: string;
  } {
    const parameters = generatorViewActionQueryParameter(viewAction, {
      usingLastedModule: true
    }) as Record<string, unknown>;
    if (this.inline) {
      parameters.id = this.activeRecords?.[0]?.id;
      parameters.context = JSON.stringify(this.buildContext(this.activeRecords?.[0] || {}));
    }
    return {
      title: ModuleService.generatorViewTitle(viewAction) || document.title,
      parameters: JSON.stringify(parameters)
    };
  }
}
