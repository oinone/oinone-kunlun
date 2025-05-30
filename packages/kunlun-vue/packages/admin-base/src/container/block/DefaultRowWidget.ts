import { BooleanHelper } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import {
  DEFAULT_CARD_GUTTERS,
  DEFAULT_GUTTERS,
  DEFAULT_VERTICAL_GUTTERS,
  LayoutHelper,
  StandardGutterType
} from '@kunlun/vue-ui-common';
import { Widget } from '@kunlun/vue-widget';
import { getCurrentThemeSize } from '@kunlun/engine';
import { isEmpty, isNil, isString } from 'lodash-es';
import { BasePackWidget } from '../../basic';
import DefaultRow from './DefaultRow.vue';

@SPI.ClassFactory(BasePackWidget.Token({ widget: 'row' }))
export class DefaultRowWidget extends BasePackWidget {
  @Widget.Reactive()
  private get getDefaultGutters() {
    const size = getCurrentThemeSize();

    switch (size) {
      case 'large':
        return DEFAULT_GUTTERS;
      case 'medium':
        return DEFAULT_VERTICAL_GUTTERS;
      default:
        return DEFAULT_CARD_GUTTERS;
    }
  }

  @Widget.Reactive()
  @Widget.Inject()
  protected isCard: boolean | undefined;

  public customDefaultGutter: StandardGutterType | undefined;

  public get defaultGutter(): StandardGutterType {
    if (this.customDefaultGutter) {
      return this.customDefaultGutter;
    }
    if (this.isCard) {
      return DEFAULT_CARD_GUTTERS;
    }
    return this.getDefaultGutters;
  }

  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultRow);
    return this;
  }

  @Widget.Reactive()
  protected get align(): string {
    return this.getDsl().align?.toLowerCase();
  }

  /**
   * 布局容器的栅格间隔
   */
  @Widget.Reactive()
  @Widget.Inject()
  public containersGutter!: number[];

  @Widget.Reactive()
  protected get gutter(): number[] {
    const { gutter, rowGutter, colGutter } = this.getDsl();
    if (!isNil(rowGutter) || !isNil(colGutter)) {
      return [colGutter, rowGutter];
    }

    if (this.containersGutter) {
      return this.containersGutter;
    }

    if (!isEmpty(gutter)) {
      if (isString(gutter)) {
        return LayoutHelper.convertGutter(gutter, this.defaultGutter);
      }
      return gutter;
    }

    return this.defaultGutter;
  }

  @Widget.Reactive()
  protected get justify(): string {
    return this.getDsl().justify?.toLowerCase();
  }

  @Widget.Reactive()
  protected get flexLayout(): string {
    return this.getDsl().flexLayout?.toLowerCase();
  }

  @Widget.Reactive()
  protected get flexDirection(): string {
    return this.getDsl().flexDirection?.toLowerCase();
  }

  @Widget.Reactive()
  protected get wrap(): boolean | undefined {
    let { wrap } = this.getDsl();
    if (isNil(wrap)) {
      wrap = true;
    }
    return BooleanHelper.toBoolean(wrap);
  }
}
