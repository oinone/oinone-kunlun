import { SPI } from '@kunlun/spi';
import { MaskWidget } from '@kunlun/vue-admin-layout';
import { Widget } from '@kunlun/vue-widget';
import CustomView from './components/PermissionMode.vue';
import { IPermissionModeEnum } from './types';

@SPI.ClassFactory(MaskWidget.Token({ dslNodeType: 'permission-mode' }))
export class PermissionModeMaskWidget extends MaskWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(CustomView);
    return this;
  }

  @Widget.Reactive()
  public get permissionMode(): IPermissionModeEnum {
    const { permissionMode } = this.getDsl();
    return permissionMode as unknown as IPermissionModeEnum;
  }
}
