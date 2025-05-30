import { ModelFieldType, ViewType } from '@kunlun/meta';
import { isDev } from '@kunlun/router';
import { BooleanHelper, NumberHelper } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { SliderDirection } from '@kunlun/vue-ui-common';
import { Widget } from '@kunlun/vue-widget';
import { isNil } from 'lodash-es';
import { FormFieldWidget } from '../../../basic';
import DefaultSlider from './DefaultSlider.vue';
import { FormIntegerFieldWidget } from './FormIntegerFieldWidget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form],
    ttype: [ModelFieldType.Integer],
    widget: 'Slider'
  })
)
export class FormIntegerSliderFieldWidget extends FormIntegerFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultSlider);
    if (isNil(this.value)) {
      this.setValue(this.min);
    }
    return this;
  }

  @Widget.Reactive()
  protected get min(): string | number | undefined {
    let min = NumberHelper.toNumber(this.getDsl().min);
    if (isNil(min)) {
      min = 0;
    }
    return min;
  }

  @Widget.Reactive()
  protected get max(): string | number | undefined {
    let max = NumberHelper.toNumber(this.getDsl().max);
    if (isNil(max)) {
      if (isDev()) {
        console.warn(`滑动输入框必须配置最大值`);
      }
      max = 100;
    }
    return max;
  }

  @Widget.Reactive()
  protected get step() {
    let step = NumberHelper.toNumber(this.getDsl().step);
    if (isNil(step)) {
      step = 1;
    }
    return step;
  }

  @Widget.Reactive()
  protected get direction() {
    let direction = this.getDsl().direction?.toLowerCase?.();
    if (isNil(direction)) {
      direction = SliderDirection.HORIZONTAL;
    }
    return direction;
  }

  @Widget.Reactive()
  protected get reverse(): boolean {
    let reverse = BooleanHelper.toBoolean(this.getDsl().reverse);
    if (isNil(reverse)) {
      reverse = false;
    }
    return reverse;
  }

  @Widget.Reactive()
  protected get hasTooltip(): boolean {
    let hasTooltip = BooleanHelper.toBoolean(this.getDsl().hasTooltip);
    if (isNil(hasTooltip)) {
      hasTooltip = !!this.tooltipFormatter;
    }
    return hasTooltip;
  }

  @Widget.Reactive()
  protected get tooltipFormatter(): string | undefined {
    return this.getDsl().tooltipFormatter;
  }
}
