import { BooleanHelper, CSSStyle } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { StyleHelper } from '@oinone/kunlun-vue-ui-common';
import { Widget } from '@oinone/kunlun-vue-widget';
import { isNil, isString } from 'lodash-es';
import { BasePackWidget } from '../../basic';
import { DefaultRowWidget } from './DefaultRowWidget';

@SPI.ClassFactory(BasePackWidget.Token({ widget: 'container' }))
export class DefaultContainerWidget extends DefaultRowWidget {
  @Widget.Reactive()
  protected get style(): string | Partial<CSSStyle> | undefined {
    return {
      ...(StyleHelper.parse(super.style as string) || {}),
      height: '100%'
    } as CSSStyle;
  }

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
