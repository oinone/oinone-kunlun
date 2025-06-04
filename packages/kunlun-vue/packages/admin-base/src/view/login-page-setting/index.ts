import { ViewType } from '@oinone/kunlun-meta';

import { LayoutManager } from '../../spi';

LayoutManager.register(
  {
    viewType: ViewType.Form,
    moduleName: 'sysSetting',
    model: 'sysSetting.GlobalAppConfigProxy',
    actionName: 'SysSettingMenus_GlobalMenu_LoginMenu'
  },
  `<view type="Form">
      <element invisible="true" widget="actionBar" slot="actionBar" slotSupport="action">
        <xslot name="actions" slotSupport="action" />
      </element>
      <element widget="LoginPageSettingWidget" slotSupport="field">
      </element>
</view>`
);

export * from './LoginPageSettingWidget';
