import { VueWidget } from '@oinone/kunlun-vue-widget';
import { RootComponentSPI } from '../spi';

export class DefaultRoot extends VueWidget {
  public initialize() {
    if (process.env.NODE_ENV === 'development') {
      (window as any).__WIDGET_ROOT_ = this;
    }
    try {
      super.initialize();
      RootComponentSPI.Selector().forEach((widget) => {
        this.createWidget(widget);
      });
    } catch (e) {
      console.error(e);
    }
    return this;
  }
}
