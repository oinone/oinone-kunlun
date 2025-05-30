import { BooleanHelper } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { DEFAULT_GUTTERS, LayoutHelper, StandardGutterType } from '@kunlun/vue-ui-common';
import { Widget } from '@kunlun/vue-widget';
import { isEmpty, isNil, isString } from 'lodash-es';
import { BasePackWidget } from '../../basic';
import DefaultBlock from './DefaultBlock.vue';

@SPI.ClassFactory(BasePackWidget.Token({ widget: 'block' }))
export class DefaultBlockWidget extends BasePackWidget {
  /**
   * 默认间距
   */
  public defaultGutter: StandardGutterType = DEFAULT_GUTTERS;

  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultBlock);
    return this;
  }

  @Widget.Reactive()
  public inline = false;

  @Widget.Reactive()
  public get flex(): boolean {
    let flex = BooleanHelper.toBoolean(this.getDsl().flex);
    if (isNil(flex)) {
      flex = false;
    }
    return flex;
  }

  @Widget.Reactive()
  public get flexDirection() {
    return this.getDsl().flexDirection?.toLowerCase();
  }

  @Widget.Reactive()
  protected get gutter(): number[] {
    const { gutter } = this.getDsl();
    if (!isEmpty(gutter)) {
      if (isString(gutter)) {
        return LayoutHelper.convertGutter(gutter, this.defaultGutter);
      }
      return gutter;
    }
    return this.defaultGutter;
  }

  @Widget.Reactive()
  public get layout(): string | undefined {
    const { layout } = this.getDsl();
    if (isString(layout)) {
      return layout.toLowerCase();
    }
    return undefined;
  }
}
