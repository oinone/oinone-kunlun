import { Dialog, Drawer, translateValueByKey } from '@kunlun/engine';
import { ModelDefaultActionName } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { ButtonType } from '@kunlun/vue-ui-common';
import { Widget } from '@kunlun/vue-widget';
import { isFunction } from 'lodash-es';
import { ClickResult } from '../../../../typing';
import { ActionWidget } from '../../../component';

@SPI.ClassFactory(
  ActionWidget.Token({
    name: ModelDefaultActionName.$$internal_DialogCancel
  })
)
export class PopupCancelActionWidget extends ActionWidget {
  @Widget.Reactive()
  protected get label() {
    return this.getDsl().label || this.action?.displayName || translateValueByKey('取消');
  }

  @Widget.Method()
  @Widget.Inject()
  private onCancel: (() => ClickResult) | undefined;

  @Widget.Reactive()
  protected get type(): string {
    if (this.inline) {
      return ButtonType.link;
    }
    return this.getDsl().type?.toLowerCase?.() || ButtonType.default;
  }

  protected async clickAction() {
    if (isFunction(this.onCancel)) {
      const clickResult = await this.onCancel();
      return clickResult;
    }
    return false;
  }

  protected clickActionAfter(result: ClickResult): ClickResult {
    if (this.isDialog) {
      if (this.closeDialog) {
        Dialog.dispose(this.action);
      }
    } else if (this.isDrawer) {
      if (this.closeDrawer) {
        Drawer.dispose(this.action);
      }
    }
    return result;
  }
}
