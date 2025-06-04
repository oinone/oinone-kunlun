import { SPI } from '@oinone/kunlun-spi';
import { RouterWidget } from '@oinone/kunlun-vue-router';
import { Widget } from '@oinone/kunlun-vue-widget';
import { DEBUG_VIEW_WIDGET } from '../constants';
import { DebugResponseData } from '../typing';
import { DebugApiWidget } from './debug-api/DebugApiWidget';
import { DebugUtils } from './debug-utils';
import { DebugViewWidget } from './debug-view/DebugViewWidget';
import DebugMainView from './DebugMainView.vue';

@SPI.ClassFactory(RouterWidget.Token({ widget: DEBUG_VIEW_WIDGET }))
export class DebugMainViewWidget extends RouterWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DebugMainView);
    return this;
  }

  @Widget.Provide()
  @Widget.Reactive()
  protected activeDebugTab = 'debugView';

  @Widget.Method()
  protected changeActiveDebugTab(activeDebugTab: string) {
    this.activeDebugTab = activeDebugTab;
  }

  @Widget.Method()
  protected async responseAnalysis(responseBody: DebugResponseData | DebugResponseData[]) {
    const debugApiWidget = this.getChildrenInstance().find((v) => v instanceof DebugApiWidget) as DebugApiWidget;
    if (debugApiWidget) {
      await debugApiWidget.resetInfo();
      DebugUtils.getDebugStorage().responseData = await debugApiWidget.responseAnalysis(responseBody);
      DebugUtils.getDebugStorage().forceUpdate();
    }
  }

  protected created() {
    this.createWidget(DebugViewWidget, 'debugView');
    this.createWidget(DebugApiWidget, 'debugApi');
  }
}
