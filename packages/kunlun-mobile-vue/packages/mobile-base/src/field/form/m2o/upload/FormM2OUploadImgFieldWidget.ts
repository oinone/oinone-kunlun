import { ModelFieldType, RuntimeConfig, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';

import { FormFieldWidget, FormM2OFieldWidget } from '../../../../basic';
import { UploadImgCom } from '../../../../components';
import { MultipartUploadRuntimeConfig } from '@oinone/kunlun-vue-ui-common';
import { ConfigHelper } from '@oinone/kunlun-engine';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Detail],
    ttype: ModelFieldType.ManyToOne,
    widget: ['UploadImg']
  })
)
export class FormM2OUploadImgFieldWidget extends FormM2OFieldWidget {
  public initialize(config) {
    super.initialize(config);
    this.setComponent(UploadImgCom);
    return this;
  }

  protected getMultipartUploadConfig(): MultipartUploadRuntimeConfig {
    return ConfigHelper.getConfig(RuntimeConfig.getConfig('multipartUpload'));
  }

  public async fetchData() {
    // if (this.fieldElement.loadApi || this.fieldElement.load) {
    //   const model = await getModel(this.field.references!);
    //   const labelModelFields = getLabelFieldList4query(
    //     this.getDsl().optionLabel,
    //     model.labelFields!,
    //     model.modelFields
    //   );
    //   const data = await queryFieldData4Form(
    //     this.field,
    //     this.fieldElement,
    //     labelModelFields,
    //     this.getSelfViewWidget()!.getDsl(),
    //     this.formData,
    //     [this.formData],
    //     this.rootData,
    //     useMatched().matched.segmentParams.page.scene
    //   );
    //   this.formData[this.field.name] = data;
    //   return this.formData[this.field.name] as Entity;
    // }
    // const { references, referenceFields, relationFields } = this.field;
    // if (!references || !referenceFields || !relationFields) {
    //   return {};
    // }
    // if (!this.field.relationStore) {
    //   this.viewWidget?.loadData(this.formData[this.field.name] as Record<string, unknown>[]);
    //   return;
    // }
    // if (Object.keys((this.value || {}) as Record<string, unknown>).filter((name) => !name.includes('_')).length === 0) {
    //   const queryData = createRelationQueryData(relationFields, relationFields, this.formData);
    //   let data = {};
    //   if (Object.keys(queryData).length > 0) {
    //     data = (await queryOne(references, queryData)) as Record<string, unknown>;
    //   }
    //   if (Object.keys(data).length > 0) {
    //     this.formData[this.field.name] = data;
    //   }
    // }
  }

  @Widget.Reactive()
  protected limit = 1;

  @Widget.Method()
  protected getImportFile(data) {
    this.change((data && data[0]) || null);
  }

  @Widget.Method()
  public change(v) {
    const value = Array.isArray(v) ? v[0] || null : {};
    super.change(value);

    this.blur();
  }

  @Widget.Method()
  protected remove(file) {
    if (file) {
      this.change(null as any);

      this.blur();
    }
  }

  @Widget.Reactive()
  protected get allLimitSize() {
    return this.getDsl().allLimitSize || '';
  }

  @Widget.Reactive()
  public get isLink() {
    return true;
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

  @Widget.Reactive()
  public get noBorderBottom() {
    return true;
  }

  @Widget.Reactive()
  public get showAllowClear() {
    return false;
  }
}
