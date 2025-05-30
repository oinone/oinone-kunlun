import { Dialog, Drawer, translateValueByKey } from '@kunlun/engine';
import { ModelDefaultActionName } from '@kunlun/meta';
import { BooleanHelper } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { isBoolean, isFunction, isNil } from 'lodash-es';
import { ClickResult, PopupSubmitFunction, PopupSubmitParameters } from '../../../../typing';
import { ActionWidget } from '../../../component';

@SPI.ClassFactory(ActionWidget.Token({ name: ModelDefaultActionName.$$internal_DialogSubmit }))
export class PopupSubmitActionWidget extends ActionWidget {
  @Widget.Reactive()
  protected get label() {
    return this.getDsl().label || this.action?.displayName || translateValueByKey('确定');
  }

  @Widget.Reactive()
  protected get updateData(): boolean {
    let updateData = BooleanHelper.toBoolean(this.getDsl().updateData);
    if (isNil(updateData)) {
      updateData = false;
    }
    return updateData;
  }

  @Widget.Reactive()
  protected get validateForm(): boolean {
    let validateForm = BooleanHelper.toBoolean(this.getDsl().validateForm);
    if (isNil(validateForm)) {
      validateForm = true;
    }
    return validateForm;
  }

  @Widget.Method()
  @Widget.Inject()
  protected onSubmit: PopupSubmitFunction | undefined;

  @Widget.Method()
  protected async clickAction() {
    if (isFunction(this.onSubmit)) {
      const clickResult = await this.onSubmit({ mapping: this.action.mapping, action: this.action });
      return clickResult;
    }
    return false;
  }

  protected reloadDataSourceAndRecords(result: ClickResult) {
    if (this.updateData) {
      if (result && !isBoolean(result)) {
        const { submitRecords } = result as unknown as PopupSubmitParameters;
        const rst = Array.isArray(result) ? result : submitRecords;
        this.reloadDataSource(rst);
        this.reloadActiveRecords(rst);
      }
    }
  }

  protected clickActionAfter(result: ClickResult): ClickResult {
    if (this.isDialog) {
      if (this.closeDialog) {
        this.reloadDataSourceAndRecords();
        Dialog.dispose(this.action);
      }
    } else if (this.isDrawer) {
      this.reloadDataSourceAndRecords();
      if (this.closeDrawer) {
        Drawer.dispose(this.action);
      }
    }
    return result;
  }
}
