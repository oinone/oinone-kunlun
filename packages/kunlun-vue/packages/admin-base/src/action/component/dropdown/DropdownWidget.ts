import { DEFAULT_SLOT_NAME } from '@kunlun/dsl';
import { SPI } from '@kunlun/spi';
import { ButtonType } from '@kunlun/vue-ui-common';
import { Widget } from '@kunlun/vue-widget';
import { isArray, isString } from 'lodash-es';
import { BaseActionGroupWidget, BaseElementWidget } from '../../../basic';
import DefaultDropdown from './DefaultDropdown.vue';

@SPI.ClassFactory(BaseElementWidget.Token({ widget: 'dropdown' }))
export class DropdownWidget extends BaseActionGroupWidget {
  public initialize(props) {
    if (!props.slotNames) {
      props.slotNames = [DEFAULT_SLOT_NAME, 'trigger'];
    }
    super.initialize(props);
    this.setComponent(DefaultDropdown);
    return this;
  }

  @Widget.Reactive()
  protected get label() {
    return this.getDsl().label;
  }

  @Widget.Reactive()
  protected get icon() {
    return this.getDsl().icon;
  }

  @Widget.Reactive()
  protected get type(): string {
    const type = this.getDsl().type?.toLowerCase?.();
    if (!type) {
      if (this.inline) {
        return ButtonType.link;
      }
      return ButtonType.primary;
    }
    return type;
  }

  @Widget.Reactive()
  protected get trigger() {
    const dslTrigger = this.getDsl().trigger;
    if (isArray(dslTrigger)) {
      return dslTrigger;
    }
    if (isString(dslTrigger)) {
      return dslTrigger.split(',').map((v) => v.trim());
    }
    return dslTrigger;
  }
}
