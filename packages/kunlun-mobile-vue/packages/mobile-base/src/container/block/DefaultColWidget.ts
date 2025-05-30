import { ColSpanEnum } from '@kunlun/engine';
import { NumberHelper, Optional } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { DEFAULT_COLS } from '@kunlun/vue-ui-common';
import { Widget } from '@kunlun/vue-widget';
import { isNaN, isNil, isString } from 'lodash-es';
import { BasePackWidget } from '../../basic';
import DefaultCol from './DefaultCol.vue';
import { DefaultRowWidget } from './DefaultRowWidget';

@SPI.ClassFactory(BasePackWidget.Token({ widget: 'col' }))
export class DefaultColWidget extends BasePackWidget {
  protected rowWidget: DefaultRowWidget;

  public constructor(rowWidget: DefaultRowWidget) {
    super();
    this.rowWidget = rowWidget;
  }

  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultCol);
    return this;
  }

  @Widget.Reactive()
  public get offset(): number {
    const { cols } = this.rowWidget;
    let offset = NumberHelper.toNumber(this.getDsl().offset);
    if (!offset || offset <= 0) {
      offset = 0;
    }
    return (DEFAULT_COLS / cols) * offset;
  }

  @Widget.Reactive()
  public get span(): number {
    const { cols } = this.rowWidget;
    let dslSpan: string | number | undefined = Optional.ofNullable(this.getDsl().colSpan).orElse(this.getDsl().span);
    if (isString(dslSpan)) {
      const colSpan = ColSpanEnum[dslSpan.toUpperCase()];
      if (colSpan) {
        dslSpan = cols * colSpan;
      }
    }
    let span = NumberHelper.toNumber(dslSpan);
    if (isNil(span) || isNaN(span) || span <= 0) {
      span = cols;
    }
    if (span > cols) {
      span = cols;
    }
    return (DEFAULT_COLS / cols) * span;
  }

  @Widget.Reactive()
  protected get mode() {
    let { mode } = this.getDsl();
    if (isNil(mode)) {
      mode = this.getDsl().widthType;
    }
    return mode?.toLowerCase?.();
  }

  @Widget.Reactive()
  public get width() {
    return this.getDsl().width;
  }

  @Widget.Reactive()
  public get minWidth() {
    return this.getDsl().minWidth;
  }

  @Widget.Reactive()
  public get maxWidth() {
    return this.getDsl().maxWidth;
  }
}
