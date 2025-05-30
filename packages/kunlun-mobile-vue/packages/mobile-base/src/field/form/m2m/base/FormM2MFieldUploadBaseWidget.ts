import { Widget } from '@kunlun/vue-widget';
import { FormM2MFieldWidget } from '../../../../basic';
import { MultipartUploadRuntimeConfig } from '@kunlun/vue-ui-common';
import { ConfigHelper } from '@kunlun/engine';
import { RuntimeConfig } from '@kunlun/meta';

export abstract class FormM2MFieldUploadBaseWidget extends FormM2MFieldWidget {
  public initialize(config) {
    super.initialize(config);
    return this;
  }

  protected getMultipartUploadConfig(): MultipartUploadRuntimeConfig {
    return ConfigHelper.getConfig(RuntimeConfig.getConfig('multipartUpload'));
  }

  @Widget.Reactive()
  protected get limit() {
    return this.getDsl().limit || -1;
  }

  @Widget.Reactive()
  protected get limitSize() {
    return this.getDsl().limitSize;
  }

  @Widget.Reactive()
  protected get allLimitSize() {
    return this.getDsl().allLimitSize || '';
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
  protected get cdnKey() {
    return this.getDsl().cdnKey?.trim?.();
  }

  @Widget.Reactive()
  protected get chunkUploadThreshold() {
    return this.getDsl().chunkUploadThreshold || this.getMultipartUploadConfig().chunkUploadThreshold || 10;
  }

  @Widget.Method()
  public change(data) {
    super.change(data || null);
  }

  @Widget.Method()
  protected remove(file) {
    const fileList = [...(this.value as any[])];
    const index = fileList.findIndex((item) => file.id === item.id);
    if (index >= 0) {
      fileList.splice(index, 1);
    }
    this.change(fileList);
  }

  @Widget.Reactive()
  public get showAllowClear() {
    return false;
  }
}
