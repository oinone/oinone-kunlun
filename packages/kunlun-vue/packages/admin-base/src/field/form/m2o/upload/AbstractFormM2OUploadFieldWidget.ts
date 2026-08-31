import { BooleanHelper } from '@oinone/kunlun-shared';
import { defaultMultiPartConfig } from '@oinone/kunlun-vue-ui-common';
import { Widget } from '@oinone/kunlun-vue-widget';
import { isFinite, isNumber } from 'lodash-es';
import { FormM2OFieldWidget } from '../../../../basic';

export abstract class AbstractFormM2OUploadFieldWidget extends FormM2OFieldWidget {
  @Widget.Reactive()
  private limit = 1;

  @Widget.Reactive()
  protected get limitSize(): number {
    const dslLimitSize = this.getDsl().limitSize;
    if (dslLimitSize == null) {
      return -1;
    }
    let limitSize = Number(dslLimitSize);
    if (isNumber(limitSize) && isFinite(limitSize)) {
      return limitSize;
    }
    limitSize = Number(this.executeExpression(dslLimitSize, dslLimitSize));
    if (isNumber(limitSize) && isFinite(limitSize)) {
      return limitSize;
    }
    return -1;
  }

  @Widget.Reactive()
  protected get allLimitSize() {
    return this.getDsl().allLimitSize || '';
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

  @Widget.Reactive()
  protected get cdnKey() {
    return this.getDsl().cdnKey?.trim?.();
  }

  @Widget.Reactive()
  protected get privateLink() {
    return BooleanHelper.toBoolean(this.getDsl().privateLink);
  }
}
