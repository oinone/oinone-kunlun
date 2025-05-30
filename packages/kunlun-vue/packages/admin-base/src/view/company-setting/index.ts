import { ViewType } from '@kunlun/meta';

import { LayoutManager } from '../../spi';

LayoutManager.register(
  {
    viewType: ViewType.Form,
    moduleName: 'sysSetting',
    model: 'sysSetting.GlobalAppConfigProxy',
    actionName: 'SysSettingMenus_GlobalMenu_CorporateImageMenu'
  },
  `<view type="Form">
      <element widget="CompanySettingWidget" slotSupport="field">
      </element>
</view>`
);

export * from './CompanySettingWidget';
