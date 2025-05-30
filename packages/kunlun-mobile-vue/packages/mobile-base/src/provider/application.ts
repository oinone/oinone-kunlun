import { SPI } from '@kunlun/spi';
import { Root, ROOT_TOKEN } from '../basic';
import { RootComponentSPI } from '../spi';

@SPI.Provide(ROOT_TOKEN)
export class DefaultRoot extends Root {
  public initialize(): Root {
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
