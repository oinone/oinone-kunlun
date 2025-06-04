import { Widget } from '@oinone/kunlun-vue-widget';
import { defaultMultiPartConfig } from '@oinone/kunlun-vue-ui-common';

import { FormM2MFieldWidget } from '../../../../basic';

export abstract class FormM2MFieldUploadBaseWidget extends FormM2MFieldWidget {
  public initialize(config) {
    super.initialize(config);
    return this;
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
  protected get multiple(): boolean {
    const _multiple = this.getDsl().multi;
    return _multiple === true;
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
  protected get limitFileExtensions() {
    return this.getDsl().limitFileExtensions;
  }

  @Widget.Method()
  public change(data) {
    super.change(data || null);
  }

  @Widget.Method()
  private remove(file) {
    const fileList = [...(this.value as any[])];
    const index = fileList.findIndex((item) => file.id === item.id);
    if (index >= 0) {
      fileList.splice(index, 1);
    }
    this.change(fileList);
  }
}
