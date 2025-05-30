import { BooleanHelper } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { isNil, isString } from 'lodash-es';
import { BasePackWidget } from '../../basic';
import { DefaultRowWidget } from './DefaultRowWidget';

@SPI.ClassFactory(BasePackWidget.Token({ widget: 'container' }))
export class DefaultContainerWidget extends DefaultRowWidget {
  @Widget.Reactive()
  protected style = { height: '100%' } as CSSStyleDeclaration;

  @Widget.Reactive()
  public get layout(): string | undefined {
    const { layout } = this.getDsl();
    if (isString(layout)) {
      return layout.toLowerCase();
    }
    return undefined;
  }

  @Widget.Reactive()
  public get allInvisible() {
    const { allInvisible } = this.getDsl();
    if (isNil(allInvisible)) {
      return false;
    }
    return BooleanHelper.toBoolean(allInvisible);
  }
}
