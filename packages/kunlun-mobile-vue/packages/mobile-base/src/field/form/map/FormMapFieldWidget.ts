import { SubmitHandler, SubmitValue, translateValueByKey } from '@kunlun/engine';
import { ModelFieldType, ViewType } from '@kunlun/meta';
import { CallChaining, ReturnPromise } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { FormFieldWidget } from '../../../basic';
import { ValidatorInfo } from '../../../typing';
import DefaultMap from './DefaultMap.vue';
import { MapItem } from './typing';

@SPI.ClassFactory(FormFieldWidget.Token({ ttype: ModelFieldType.Map, viewType: [ViewType.Form, ViewType.Detail] }))
export class FormMapFieldWidget extends FormFieldWidget<Record<string, string>> {
  @Widget.Reactive()
  @Widget.Inject()
  protected mountedCallChaining: CallChaining | undefined;

  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultMap);
    return this;
  }

  @Widget.Reactive()
  protected items: MapItem[] = [];

  @Widget.Reactive()
  protected get limit() {
    return this.getDsl().limit || undefined;
  }

  @Widget.Method()
  protected addRecord() {
    this.items.push({ name: '', value: '' });
  }

  @Widget.Method()
  protected removeRecord(index: number) {
    this.items.splice(index, 1);
    this.onHandleChange();
  }

  @Widget.Method()
  protected onHandleChange() {
    this.change(this.generatorValue());
  }

  protected generatorValue(): Record<string, string> | null | undefined {
    if (!this.items.length) {
      return null;
    }
    const res: Record<string, string> = {};
    this.items.forEach((item) => {
      if (item.name && item.value) {
        res[item.name] = item.value;
      }
    });
    return res;
  }

  public async submit(submitValue: SubmitValue) {
    return SubmitHandler.DEFAULT(this.field, this.itemName, submitValue, this.generatorValue());
  }

  public async validator(): Promise<ValidatorInfo> {
    if (this.required) {
      if (this.items.length === 0) {
        return this.validatorError(
          `${translateValueByKey('字段')} ${this.field.displayName} ${translateValueByKey('不能为空')}`
        );
      }
    }
    if (this.items.length) {
      const keys = this.items.map((v) => v.name);
      const uniqKeys = Array.from(new Set(keys));

      if (keys.length !== uniqKeys.length) {
        return this.validatorError(translateValueByKey('字段不允许有重复的key'));
      }
    }
    return this.validatorSuccess();
  }

  protected mountedProcess(): ReturnPromise<void> {
    const { value } = this;
    if (value) {
      this.items = Object.entries(value).map(([key, val]) => {
        const item: MapItem = {
          name: key,
          value: val
        };
        return item;
      });
    } else {
      this.items = [];
    }
  }

  @Widget.Reactive()
  public get isAutoHeight() {
    return true;
  }

  @Widget.Reactive()
  public get noBorderBottom() {
    return true;
  }

  protected $$mounted() {
    super.$$mounted();
    if (this.mountedCallChaining) {
      this.mountedCallChaining.hook(this.path, async () => {
        await this.mountedProcess();
      });
    } else {
      this.mountedProcess();
    }
  }

  protected $$unmounted() {
    super.$$unmounted();
    this.mountedCallChaining?.unhook(this.path);
  }
}
