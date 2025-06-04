import { translateValueByKey } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { defaultMultiPartConfig, ValidateTrigger, WidgetTrigger } from '@oinone/kunlun-vue-ui-common';
import { Widget } from '@oinone/kunlun-vue-widget';
import { isArray, isNumber } from 'lodash-es';
import { FormFieldWidget } from '../../../../basic';
import { ValidatorInfo } from '../../../../typing';
import { FormStringInputFieldWidget } from '../input';
import DefaultFormSingleMedia from './DefaultFormSingleMedia.vue';

enum FileSource {
  UPLOAD = 'UPLOAD',
  INPUT = 'INPUT'
}

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Form,
    ttype: ModelFieldType.String,
    widget: ['MediaPlayer']
  })
)
export class FormStringMediaPlayerFieldWidget extends FormStringInputFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultFormSingleMedia);
    return this;
  }

  @Widget.Reactive()
  protected get fileSource() {
    return this.getDsl().fileSource;
  }

  @Widget.Reactive()
  protected get partSize() {
    return this.getDsl().partSize || defaultMultiPartConfig.partSize;
  }

  @Widget.Reactive()
  protected get chunkUploadThreshold() {
    return this.getDsl().chunkUploadThreshold || defaultMultiPartConfig.chunkUploadThreshold;
  }

  @Widget.Reactive()
  protected get parallel() {
    return this.getDsl().parallel || defaultMultiPartConfig.parallel;
  }

  @Widget.Reactive()
  public get validateTrigger(): ValidateTrigger[] {
    if (this.fileSource === FileSource.UPLOAD) {
      return [ValidateTrigger.CHANGE];
    }
    return super.validateTrigger;
  }

  @Widget.Method()
  public change(value) {
    if (this.fileSource === FileSource.UPLOAD && value) {
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
  }

  @Widget.Reactive()
  protected get limit(): number {
    const limit = Number(this.getDsl().limit || this.field.limit || -1);
    if (isNumber(limit)) {
      return limit;
    }
    return -1;
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
  protected get multiple(): boolean {
    const _multiple = this.getDsl().multi;
    return _multiple === true;
  }

  @Widget.Reactive()
  protected get limitFileExtensions() {
    return this.getDsl().limitFileExtensions;
  }

  protected validateLength(realValue: string): ValidatorInfo {
    if (!this.field.store) {
      // 非存储不校验数据库字段size
      return this.validatorSuccess();
    }
    const size = this.field.size;
    if (size && realValue) {
      const currentValueLength = JSON.stringify(realValue).length;
      if (currentValueLength > size) {
        return this.validatorError(
          `${translateValueByKey('链接总长度')}${currentValueLength}${translateValueByKey('超出字段大小')}: ${size}`
        );
      }
    }
    return this.validatorSuccess();
  }

  protected defaultConstructDataTrigger() {
    return [WidgetTrigger.CHANGE];
  }

  protected defaultClearFieldsTrigger() {
    return [WidgetTrigger.CHANGE];
  }
}

/**
 * @deprecated please using FormStringMediaPlayerFieldWidget
 */
export const FormStringSingleMediaWidget = FormStringMediaPlayerFieldWidget;
