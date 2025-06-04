import { RuntimeEnumerationField, RuntimeEnumerationOption, translateValueByKey } from '@oinone/kunlun-engine';
import { deepClone } from '@oinone/kunlun-meta';
import { BooleanHelper } from '@oinone/kunlun-shared';
import { WidgetTrigger } from '@oinone/kunlun-vue-ui-common';
import { Widget } from '@oinone/kunlun-vue-widget';
import { isNil, toString } from 'lodash-es';
import { FormFieldWidget } from '../../../basic';
import { isValidatorSuccess, ValidatorInfo } from '../../../typing';
import { OptionColorStyle } from '../../FieldCommonEnum';
import { enumFetchLabelByValue } from '../../util';

export type EnumerationValue = boolean | string;

export abstract class FormEnumFieldAbstractWidget<
  Value extends EnumerationValue | EnumerationValue[] = EnumerationValue | EnumerationValue[]
> extends FormFieldWidget<Value, RuntimeEnumerationField> {
  protected defaultConstructDataTrigger() {
    return [WidgetTrigger.CHANGE];
  }

  protected defaultClearFieldsTrigger() {
    return [WidgetTrigger.CHANGE];
  }

  @Widget.Reactive()
  protected get options(): RuntimeEnumerationOption[] {
    return this.getAvailableOptions();
  }

  @Widget.Reactive()
  protected get autocorrection() {
    return BooleanHelper.toBoolean(this.getDsl().autocorrection);
  }

  protected compute() {
    // const multi = this.field.multi;
    // const defaultVal = multi ? [] : null;
    // if (super.compute() === false) {
    //   return false;
    // }
    // return super.compute() || defaultVal;
    return super.compute();
  }

  @Widget.Reactive()
  protected get orientation() {
    const _orientation = this.getDsl().orientation as string;
    if (_orientation) {
      return _orientation;
    }
    return undefined;
  }

  @Widget.Reactive()
  protected get radioMode() {
    const _radioMode = this.getDsl().radioMode as string;
    if (_radioMode) {
      return _radioMode;
    }
    return undefined;
  }

  @Widget.Reactive()
  protected get optionColor() {
    return this.optionColorStyle === OptionColorStyle.COLORFUL;
  }

  @Widget.Reactive()
  protected get optionColorStyle() {
    return this.getDsl().optionColorStyle || OptionColorStyle.COLORFUL;
  }

  @Widget.Reactive()
  protected get maxNumber() {
    const _maxNumber = this.getDsl().maxNumber;
    if (_maxNumber) {
      return _maxNumber;
    }
    return Infinity;
  }

  @Widget.Reactive()
  protected get minNumber() {
    const _minNumber = this.getDsl().minNumber;
    if (_minNumber) {
      return _minNumber;
    }
    return -Infinity;
  }

  @Widget.Reactive()
  protected get renderOnParent() {
    const _renderOnParent = this.getDsl().renderOnParent;
    if (isNil(_renderOnParent)) {
      return false;
    }
    return _renderOnParent;
  }

  @Widget.Method()
  protected get getPopupContainer() {
    if (this.renderOnParent) {
      return (triggerNode) => {
        return triggerNode.parentNode || document.body;
      };
    }
    return null;
  }

  @Widget.Reactive()
  protected fetchLabelByValue(value) {
    return enumFetchLabelByValue(value, this.options);
  }

  public async validator(): Promise<ValidatorInfo> {
    const res = await super.validator();
    if (!isValidatorSuccess(res)) {
      return res;
    }
    const value = this.value as [];
    if (Array.isArray(value)) {
      const length = value.length;
      if (this.field.multi && (this.required || length > 0)) {
        if (this.required && !this.invisible) {
          // 兼容枚举后面减少了但value依然存在,导致数据错误提交的情况
          const optionValueList = this.options.map((_o) => _o.value);
          if (value && value.length) {
            const finalValue: string[] = [];
            for (const valueElement of value) {
              if (optionValueList.includes(valueElement)) {
                finalValue.push(valueElement);
              }
            }
            this.setValue(finalValue as Value);
            if (!finalValue.length) {
              return this.validatorError(`${this.field.label}${translateValueByKey('必填')}`);
            }
          }
        }
        if (!isNil(this.maxNumber) && length > this.maxNumber) {
          return this.validatorError(
            `${this.field.label} ${translateValueByKey('最多选择')} ${this.maxNumber} ${translateValueByKey('个')}`
          );
        }
        if (!isNil(this.minNumber) && length < this.minNumber) {
          return this.validatorError(
            `${this.field.label} ${translateValueByKey('最少选择')} ${this.minNumber} ${translateValueByKey('个')}`
          );
        }
      }
    }
    return this.validatorSuccess();
  }

  /**
   * 子类想修改options,需要重写该方法,不再支持直接赋值
   * @protected
   */
  protected getAvailableOptions(): RuntimeEnumerationOption[] {
    const xmlConfig = this.getDsl();
    let configOptions = xmlConfig?.options;
    if (!configOptions || !Array.isArray(configOptions) || !configOptions.length) {
      configOptions = this.field.options || ([] as any[]);
    }
    let xmlOptions = [] as RuntimeEnumerationOption[];
    const xmlOptionNames = [] as string[];
    for (const child of configOptions) {
      const oneOption = deepClone(child) as any;
      if (!isNil(oneOption.name)) {
        xmlOptionNames.push(oneOption.name);
      }
      const realInvisible = this.executeExpression(oneOption.invisible, false);
      if (realInvisible === undefined || !realInvisible) {
        const displayName = this.executeExpression(oneOption.displayName, oneOption.displayName);

        if (displayName?.toString() === 'NaN' && displayName !== oneOption.displayName) {
          // do nothing.
        } else {
          oneOption.displayName = displayName;
        }

        oneOption.name = toString(oneOption.name);
        oneOption.invisible = realInvisible;
        xmlOptions.push(oneOption);
      }
      if (realInvisible && this.autocorrection) {
        if (!this.field.multi && this.value === oneOption.name) {
          this.setValue(undefined);
        } else if (this.field.multi && this.value && (this.value as unknown[]).includes(oneOption.name)) {
          const realInvisibleIndex = (this.value as unknown[]).indexOf(realInvisible);
          (this.value as string[]).splice(realInvisibleIndex, 1);
        }
      }
    }

    if (!xmlOptions || xmlOptions.length === 0) {
      xmlOptions = this.field.options || [];
    }

    xmlOptions = this.handleOptions(xmlOptions);

    return xmlOptions;
  }

  protected handleOptions(ops: RuntimeEnumerationOption[]) {
    if (!ops || !ops.length) {
      return [];
    }
    const realOptions: RuntimeEnumerationOption[] = [];
    // 防止xml配置比元数据多的情况
    const metaNameList = this.getMetaOptionNames();
    ops.forEach((_o) => {
      if (metaNameList?.includes(_o.name)) {
        _o.displayName = `${_o.displayName}`;
        _o.name = `${_o.name}`;
        _o.label = _o.label || _o.displayName || _o.name;
        if (isNil(_o.value)) {
          _o.value = _o.name;
        }
        realOptions.push(_o);
      }
    });
    return realOptions;
  }

  protected getMetaOptionNames() {
    const metaOptions = this.field.options;
    return metaOptions?.map((_o) => _o.name);
  }
}
