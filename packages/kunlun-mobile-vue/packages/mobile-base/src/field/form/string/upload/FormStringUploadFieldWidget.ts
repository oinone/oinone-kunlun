import { ConfigHelper, RuntimeStringField, translateValueByKey } from '@oinone/kunlun-engine';
import { ModelFieldType, RuntimeConfig, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { MultipartUploadRuntimeConfig, ValidateTrigger, WidgetTrigger } from '@oinone/kunlun-vue-ui-common';
import { Widget } from '@oinone/kunlun-vue-widget';
import { isArray, isNumber } from 'lodash-es';
import { BaseFieldWidget, FormFieldWidget } from '../../../../basic';
import { UploadCom } from '../../../../components';
import { isValidatorSuccess, ValidatorInfo } from '../../../../typing';

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: [ViewType.Form],
    ttype: ModelFieldType.String,
    widget: 'Upload'
  })
)
export class FormStringUploadFieldWidget extends FormFieldWidget<string[], RuntimeStringField> {
  public defaultValidateTrigger: ValidateTrigger[] = [ValidateTrigger.CHANGE];

  public initialize(config) {
    super.initialize(config);
    this.setComponent(UploadCom);
    return this;
  }

  protected getMultipartUploadConfig(): MultipartUploadRuntimeConfig {
    return ConfigHelper.getConfig(RuntimeConfig.getConfig('multipartUpload'));
  }

  protected defaultConstructDataTrigger() {
    return [WidgetTrigger.CHANGE];
  }

  protected defaultClearFieldsTrigger() {
    return [WidgetTrigger.CHANGE];
  }

  @Widget.Reactive()
  protected get uploadPlaceholder() {
    return this.getDsl().uploadPlaceholder;
  }

  @Widget.Reactive()
  protected get uploadIcon() {
    return this.getDsl().uploadIcon;
  }

  @Widget.Reactive()
  protected get uploadIconText() {
    return this.getDsl().uploadIconText;
  }

  @Widget.Method()
  public change(value) {
    if (value) {
      if (this.field.multi) {
        if (isArray(value)) {
          value = value.map((v) => v.url);
        } else {
          value = [value.url];
        }
      } else if (isArray(value) && value.length >= 1) {
        value = value[0].url;
      } else {
        value = value.url;
      }
    }
    super.change(value);
    this.blur();
  }

  @Widget.Method()
  public remove(value) {
    if (value) {
      const targetUrl = value.url;
      if (this.field.multi) {
        const urls = [...(this.value || [])];
        const index = urls.findIndex((v) => v === targetUrl);
        if (index >= 0) {
          urls.splice(index, 1);
        }
        value = urls;
      } else {
        value = '';
      }
    }
    super.change(value);
    this.blur();
  }

  @Widget.Reactive()
  protected get limit(): number {
    if (!this.field.multi) {
      return 1;
    }
    const limit = Number(this.getDsl().limit || this.field.limit || -1);
    if (isNumber(limit)) {
      return limit;
    }
    return 1;
  }

  @Widget.Reactive()
  protected get limitSize(): number {
    const limitSize = Number(this.getDsl().limitSize);
    if (isNumber(limitSize)) {
      return limitSize;
    }
    return -1;
  }

  @Widget.Reactive()
  protected get allLimitSize() {
    return this.getDsl().allLimitSize || '';
  }

  @Widget.Reactive()
  protected get cdnKey() {
    return this.getDsl().cdnKey?.trim?.();
  }

  @Widget.Reactive()
  protected get multiple(): boolean {
    const _multiple = this.getDsl().multi;
    return _multiple === true;
  }

  @Widget.Reactive()
  protected get limitFileExtensions() {
    return this.getDsl().limitFileExtensions;
  }

  @Widget.Reactive()
  protected get partSize() {
    return this.getDsl().partSize || this.getMultipartUploadConfig().partSize || 5;
  }

  @Widget.Reactive()
  protected get parallel() {
    return this.getDsl().parallel || this.getMultipartUploadConfig().parallel || 4;
  }

  @Widget.Reactive()
  protected get chunkUploadThreshold() {
    return this.getDsl().chunkUploadThreshold || this.getMultipartUploadConfig().chunkUploadThreshold || 10;
  }

  public async validator(): Promise<ValidatorInfo> {
    const res = await super.validator();
    if (!isValidatorSuccess(res)) {
      return res;
    }
    if (!this.field.store) {
      // 非存储不校验数据库字段size
      return this.validatorSuccess();
    }
    if (this.field.size && this.value) {
      const currentValueLength = JSON.stringify(this.value).length;
      if (currentValueLength > this.field.size) {
        return this.validatorError(
          `${translateValueByKey('链接总长度')} ${currentValueLength} ${translateValueByKey('超出字段大小')}: ${
            this.field.size
          }`
        );
      }
    }
    return this.validatorSuccess();
  }

  @Widget.Reactive()
  public get showAllowClear() {
    return false;
  }

  @Widget.Reactive()
  public get noBorderBottom() {
    return true;
  }
}
