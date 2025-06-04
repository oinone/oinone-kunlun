import { RuntimeModelField } from '@oinone/kunlun-engine';
import { BooleanHelper } from '@oinone/kunlun-shared';
import { InputMediaMode } from '@oinone/kunlun-vue-ui-common';
import { Widget } from '@oinone/kunlun-vue-widget';
import { isNil } from 'lodash-es';
import { FormFieldWidget } from '../../../basic';

export enum InputPreSuffixType {
  ICON = 'ICON',
  TEXT = 'TEXT'
}

/**
 * 输入型组件抽象类
 */
export class FormInputAbstractFieldWidget<
  Value = string,
  Field extends RuntimeModelField = RuntimeModelField
> extends FormFieldWidget<Value, Field> {
  /**
   * 是否支持前缀
   * @protected
   */
  @Widget.Reactive()
  protected get showPrefix() {
    const _showPrefix = this.getDsl().showSuffix;
    if (_showPrefix) {
      return _showPrefix;
    }
    return false;
  }

  /**
   * 是否支持后缀
   * @protected
   */
  @Widget.Reactive()
  protected get showSuffix() {
    const _showSuffix = this.getDsl().showSuffix;
    if (_showSuffix) {
      return _showSuffix;
    }
    return false;
  }

  /**
   * 前缀具体内容
   * @protected
   */
  @Widget.Reactive()
  protected get prefix() {
    return this.getDsl().prefix;
  }

  /**
   * 后缀具体内容
   * @protected
   */
  @Widget.Reactive()
  protected get suffix() {
    return this.getDsl().suffix;
  }

  @Widget.Reactive()
  protected get independentlyEditable() {
    return BooleanHelper.toBoolean(this.getDsl().independentlyEditable);
  }

  /**
   * 前缀类型
   * @protected
   */
  @Widget.Reactive()
  protected get prefixType() {
    return this.getDsl().prefixType;
  }

  /**
   * 后缀类型
   * @protected
   */
  @Widget.Reactive()
  protected get suffixType() {
    return this.getDsl().suffixType;
  }

  /**
   * 前缀是否存储
   * @protected
   */
  @Widget.Reactive()
  protected get prefixStore() {
    const _prefixStore = this.getDsl().prefixStore;
    if (_prefixStore) {
      return _prefixStore;
    }
    return false;
  }

  /**
   * 后缀是否存储
   * @protected
   */
  @Widget.Reactive()
  protected get suffixStore() {
    const _suffixStore = this.getDsl().suffixStore;
    if (_suffixStore) {
      return _suffixStore;
    }
    return false;
  }

  @Widget.Reactive()
  protected get prefixes(): string[] {
    const _prefixes = this.getDsl().prefixes;
    if (_prefixes) {
      return _prefixes.split(',');
    }
    return [];
  }

  @Widget.Reactive()
  protected get mode() {
    return this.getDsl().mode || InputMediaMode.DYNAMIC;
  }

  @Widget.Reactive()
  protected get type() {
    return this.getDsl().type;
  }

  @Widget.Reactive()
  protected addPrefixSuffix(e: string) {
    let handledValue = e;

    if (
      this.mode === InputMediaMode.DYNAMIC &&
      this.prefixStore &&
      !isNil(this.prefix) &&
      this.prefixType === InputPreSuffixType.TEXT
    ) {
      if (!(handledValue && handledValue.startsWith(this.prefix))) {
        handledValue = `${this.prefix}${handledValue || ''}`;
      }
    }

    if (this.suffixStore && !isNil(this.suffix) && this.suffixType === InputPreSuffixType.TEXT) {
      if (!(handledValue && handledValue.endsWith(this.suffix))) {
        handledValue = `${handledValue || ''}${this.suffix}`;
      }
    }

    if (!isNil(this.prefixesValue)) {
      handledValue = `${this.prefixesValue}${handledValue || ''}`;
    }

    return handledValue;
  }

  @Widget.Reactive()
  protected removePrefixSuffix(e: string) {
    let handledValue = e;

    if (this.mode === InputMediaMode.DYNAMIC && this.prefixes && this.prefixes.length && handledValue) {
      for (const pre of this.prefixes) {
        if (pre && handledValue.startsWith(pre)) {
          if (pre != this.prefixesValue) {
            this.prefixesValue = pre;
          }
          handledValue = handledValue.replace(pre, '');
          break;
        } else {
          // this.prefixesValue = undefined;
        }
      }
    }

    if (this.prefixStore && !isNil(this.prefix) && this.prefixType === InputPreSuffixType.TEXT) {
      if (!handledValue) {
        handledValue = '';
      } else {
        const prefixLength = this.prefix.length;
        const handledValueLength = handledValue.length;
        if (prefixLength <= handledValueLength) {
          if (this.prefix === handledValue) {
            handledValue = '';
          } else {
            const compareTarget = handledValue.substring(0, prefixLength - 1 === 0 ? 1 : prefixLength);
            if (compareTarget === this.prefix) {
              handledValue = handledValue.replace(this.prefix, '');
            }
          }
        }
      }
    }

    if (this.suffixStore && !isNil(this.suffix) && this.suffixType === InputPreSuffixType.TEXT) {
      if (!handledValue) {
        handledValue = '';
        return handledValue;
      }
      const suffixLength = this.suffix.length;
      const handledValueLength = handledValue.length;
      if (suffixLength > handledValueLength) {
        return handledValue;
      }
      if (this.suffix === handledValue) {
        handledValue = '';
        return handledValue;
      }
      const compareTarget = handledValue.substring(
        handledValueLength - suffixLength,
        handledValueLength - 1 === 0 ? 1 : handledValueLength
      );
      if (compareTarget === this.suffix) {
        handledValue = handledValue.substring(0, handledValueLength - suffixLength);
      }
    }

    return handledValue;
  }

  @Widget.Reactive()
  protected inputRealValue;

  @Widget.Reactive()
  protected prefixesValue;

  @Widget.Reactive()
  public changeInputRealValue(val) {
    this.inputRealValue = val;
    this.change(this.addPrefixSuffix(val) as unknown as Value);
  }

  @Widget.Reactive()
  public changePrefixesValue(val) {
    let repVal = '';
    if (val) {
      repVal = val;
    }
    const value = this.value as unknown as string;
    if (this.prefixesValue && value) {
      this.change(value.replace(this.prefixesValue, repVal) as unknown as Value);
    } else if (this.prefixesValue && !value) {
      // 理论上不存在此情况
    } else if (!this.prefixesValue && value) {
      if (repVal && !value.startsWith(repVal)) {
        this.change((repVal + value) as unknown as Value);
      }
    } else {
      this.change(repVal as unknown as Value);
    }
    if (this.prefixesValue != val) {
      this.prefixesValue = val;
    }
  }
}
