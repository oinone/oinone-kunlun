import { BooleanHelper } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { DEFAULT_CARD_GUTTERS, DEFAULT_GUTTERS, LayoutHelper, StandardGutterType } from '@oinone/kunlun-vue-ui-common';
import { Widget } from '@oinone/kunlun-vue-widget';
import { isEmpty, isNil, isString } from 'lodash-es';
import { BasePackWidget } from '../../basic';
import DefaultRow from './DefaultRow.vue';

@SPI.ClassFactory(BasePackWidget.Token({ widget: 'row' }))
export class DefaultRowWidget extends BasePackWidget {
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
    return DEFAULT_GUTTERS;
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
