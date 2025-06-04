import {
  ActiveRecord,
  activeRecordsToJSONString,
  Dialog,
  Drawer,
  executeViewAction,
  Popup,
  RuntimeViewAction,
  translate
} from '@oinone/kunlun-engine';
import { ModelDefaultActionName, ViewType } from '@oinone/kunlun-meta';
import { CallChaining } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { ButtonType } from '@oinone/kunlun-vue-ui-common';
import { Widget } from '@oinone/kunlun-vue-widget';
import { gotoPrevPage } from '../../util';
import { ActionWidget } from '../component';

@SPI.ClassFactory(
  ActionWidget.Token({
    name: ModelDefaultActionName.$$internal_GotoListTableRouter
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
    return this.getDsl().label || this.action?.displayName || translate('kunlun.common.back') || '返回';
  }

  @Widget.Reactive()
  protected get confirmText(): string | undefined {
    if (this.isFormChange) {
      return super.confirmText;
    }
    return undefined;
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

  @Widget.Reactive()
  protected isFormChange = false;

  protected initFormData: string | undefined;

  @Widget.Reactive()
  protected get formData() {
    return this.activeRecords?.[0];
  }

  @Widget.Watch('formData', { deep: true })
  protected watchFormData(val: ActiveRecord | undefined) {
    if (this.initFormData && val && !this.isFormChange) {
      this.isFormChange = activeRecordsToJSONString(val) !== this.initFormData;
    }
  }

  protected mountedProcess() {
    if (this.viewType === ViewType.Form) {
      this.initFormData = activeRecordsToJSONString(this.activeRecords?.[0] || {});
    }
  }

  @Widget.Reactive()
  @Widget.Inject()
  protected mountedCallChaining: CallChaining | undefined;

  protected $$mounted() {
    super.$$mounted();
    this.mountedCallChaining?.hook(this.path, () => {
      this.mountedProcess();
    });
  }

  protected $$unmounted() {
    super.$$unmounted();
    this.mountedCallChaining?.unhook(this.path);
  }
}
