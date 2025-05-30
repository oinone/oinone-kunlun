import { KeyboardEventMessage } from '@kunlun/event';
import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { BaseFieldWidget, FormFieldWidget } from '../../../../basic';
import DefaultKeyboardInput from './DefaultKeyboardInput.vue';

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: ViewType.Form,
    ttype: ModelFieldType.String,
    widget: 'KeyboardInput'
  })
)
export class FormStringKeyboardInputFieldWidget extends FormFieldWidget<string> {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultKeyboardInput);
    return this;
  }

  @Widget.Reactive()
  protected get displayValue() {
    const { value, ctrlKey, altKey, shiftKey } = this;
    if (!value) {
      return '';
    }
    const keys: string[] = [];
    if (ctrlKey && this.formData[ctrlKey]) {
      keys.push('Ctrl');
    }
    if (altKey && this.formData[altKey]) {
      keys.push('Alt');
    }
    if (shiftKey && this.formData[shiftKey]) {
      keys.push('Shift');
    }
    keys.push(value);
    return keys.join(' + ');
  }

  @Widget.Reactive()
  protected get ctrlKey(): string | undefined {
    return this.getDsl().ctrl;
  }

  @Widget.Reactive()
  protected get altKey(): string | undefined {
    return this.getDsl().alt;
  }

  @Widget.Reactive()
  protected get shiftKey(): string | undefined {
    return this.getDsl().shift;
  }

  @Widget.Method()
  protected onKeypress(message: KeyboardEventMessage) {
    const { key, ctrl, alt, shift } = message;
    const { ctrlKey, altKey, shiftKey } = this;
    this.change(key);
    if (ctrlKey) {
      if (ctrl) {
        this.formData[ctrlKey] = ctrl;
      } else {
        this.formData[ctrlKey] = null;
      }
    }
    if (altKey) {
      if (alt) {
        this.formData[altKey] = alt;
      } else {
        this.formData[altKey] = null;
      }
    }
    if (shiftKey) {
      if (shift) {
        this.formData[shiftKey] = shift;
      } else {
        this.formData[shiftKey] = null;
      }
    }
  }

  @Widget.Method()
  public change(val) {
    if (!val) {
      val = null;
    }
    super.change(val);
    const { ctrlKey, altKey, shiftKey } = this;
    if (!val) {
      if (ctrlKey) {
        this.formData[ctrlKey] = null;
      }
      if (altKey) {
        this.formData[altKey] = null;
      }
      if (shiftKey) {
        this.formData[shiftKey] = null;
      }
    }
  }
}

/**
 * @deprecated please using FormStringKeyboardInputFieldWidget
 */
export const FormKeyboardInputWidget = FormStringKeyboardInputFieldWidget;
