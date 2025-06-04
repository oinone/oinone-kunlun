import { ViewType } from '@oinone/kunlun-meta';
import { registerLayout } from '../../spi';

export const installWorkbenchLayout = () => {
  registerLayout(
    `<view type="Form">
        <custom widget="Workbench" slotSupport="field">
        </custom>
</view>`,
    {
      viewType: ViewType.Table,
      moduleName: 'workbench',
      model: 'workbench.WorkBenchHomePage'
    }
  );
};

installWorkbenchLayout();
