import {
  Dialog,
  Drawer,
  executeViewAction,
  Popup,
  RuntimeViewAction,
  translate,
  translateValueByKey
} from '@oinone/kunlun-engine';
import { ModelDefaultActionName } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { ButtonType } from '@oinone/kunlun-vue-ui-common';
import { Widget } from '@oinone/kunlun-vue-widget';
import { gotoPrevPage } from '../../util';
import { ActionWidget } from '../component';

@SPI.ClassFactory(
  ActionWidget.Token({
    name: [ModelDefaultActionName.$$internal_GotoListTableRouter]
  })
)
export class BackActionWidget extends ActionWidget {
  protected defaultType = ButtonType.default;

  public initialize(config) {
    super.initialize(config);
    return this;
  }

  @Widget.Reactive()
  protected get label() {
    return (
      this.getDsl().label || this.action?.displayName || translate('kunlun.common.back') || translateValueByKey('返回')
    );
  }

  protected async clickAction() {
    if (this.isDialog) {
      Dialog.dispose(this.action);
    } else if (this.isDrawer) {
      Drawer.dispose(this.action);
    } else {
      Popup.disposeAll();

      gotoPrevPage(
        this.action,
        (action: RuntimeViewAction) => executeViewAction(action, this.$router, this.$matched),
        this.$router?.navigate
      );
    }
  }
}
