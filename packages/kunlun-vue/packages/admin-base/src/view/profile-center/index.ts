import { ViewType } from '@oinone/kunlun-meta';

import { LayoutManager } from '../../spi';

LayoutManager.register(
  {
    viewType: ViewType.Form,
    moduleName: 'MyCenter',
    model: 'my.MyPamirsUserProxy',
    actionName: 'MyCenterMenus_SettingMenu'
  },
  `<view type="Form" >
      <element widget="ProfileCenterWidget" slotSupport="field">
      </element>
</view>`
);

export * from './ProfileCenterWidget';
