import { ViewType } from '@kunlun/meta';

import { LayoutManager } from '../../../spi';

LayoutManager.register(
  {
    viewType: ViewType.Form,
    moduleName: 'sysSetting',
    model: 'sysSetting.GlobalAppConfigProxy',
    actionName: 'SysSettingMenus_ApplicationMenu_GlobalTranslationManageMenu'
  },
  `<view type="Form">
      <element invisible="true" widget="actionBar" slot="actionBar" slotSupport="action">
        <xslot name="actions" slotSupport="action" />
      </element>
      <element widget="TranslateSettingWidget" slotSupport="field">
      </element>
</view>`
);

export * from './TranslateSettingWidget';
