import { ViewType } from '@kunlun/meta';
import { LayoutManager, MaskManager } from '../../spi';

MaskManager.register(
  {
    model: 'workbench.WorkBenchHomePage',
    actionName: 'homepage'
  },
  `<mask>
    <multi-tabs />
    <header>
        <widget widget="app-switcher" />
        <block>
            <widget widget="notification" />
            <widget widget="divider" />
            <widget widget="language" />
            <widget widget="divider" />
            <widget widget="user" />
        </block>
    </header>
    <container>
      <content>
          <block height="100%" width="100%">
             <widget width="100%" widget="main-view" />
          </block>
      </content>
    </container>
</mask>`
);

LayoutManager.register(
  {
    viewType: ViewType.Table,
    moduleName: 'workbench',
    model: 'workbench.WorkBenchHomePage'
  },
  `<view type="Form">
        <element widget="Workbench" slotSupport="field"/>
</view>`
);
