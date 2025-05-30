import { RedirectTargetEnum, RuntimeUrlAction, translateValueByKey } from '@kunlun/engine';
import { Expression } from '@kunlun/expression';
import { ActionType, ViewActionTarget } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { OioMessage } from '@kunlun/vue-ui-mobile-vant';
import { ReturnPromise } from '@kunlun/shared';
import { Widget } from '@kunlun/vue-widget';

import { ActionWidget } from '../component';

@SPI.ClassFactory(ActionWidget.Token({ actionType: ActionType.URL }))
export class UrlActionWidget extends ActionWidget<RuntimeUrlAction> {
  public initialize(config) {
    super.initialize(config);
    return this;
  }

  @Widget.Reactive()
  protected get url() {
    return this.getDsl().url || this.action?.url || '#';
  }

  @Widget.Reactive()
  protected get target(): ViewActionTarget {
    return this.getDsl().target || this.action?.target || ViewActionTarget.OpenWindow;
  }

  @Widget.Reactive()
  protected get queryBody() {
    const va = this.action;
    const exp = Expression.getInstance();
    if (!va || !va.context) {
      return null;
    }
    const res: Record<string, unknown> = {};
    Object.keys(va.context || {}).forEach((name) => {
      exp.initExpressionContext(this.activeRecords, this.rootData?.[0], {}, '');
      try {
        const value = exp.exec(va.context![name] as string);
        if (value !== undefined) {
          res[name] = value;
        }
      } catch (e) {
        console.error(e);
      } finally {
        exp.cleanupExpressionContext();
      }
    });
    return res;
  }

  protected getUrl(): ReturnPromise<string | undefined> {
    let { url } = this;
    if (this.queryBody) {
      const parameters = this.resolveQueryBody();
      if (parameters) {
        url = `${url}?${parameters}`;
      }
    }

    url = this.resolveDynamicDomain(url);
    url = encodeURI(decodeURI(url));
    return url;
  }

  protected async clickAction() {
    const url = await this.getUrl();
    if (!url) {
      OioMessage.error(translateValueByKey('未设置正确的URL'));
      return;
    }

    switch (this.target) {
      case ViewActionTarget.Router:
        window.open(url, RedirectTargetEnum.SELF);
        break;
      case ViewActionTarget.OpenWindow:
      case ViewActionTarget.Frame:
        window.open(url, RedirectTargetEnum.BLANK);
        break;
      default:
        throw new Error(`Invalid target type. value = ${this.target}`);
    }
  }

  protected resolveQueryBody() {
    return Object.keys(this.queryBody!)
      .map((name) => {
        return `${name}=${this.queryBody![name]}`;
      })
      .join('&');
  }
}
