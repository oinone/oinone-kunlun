import { ViewType, ModelFieldType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { SubmitValue, SubmitHandler } from '@oinone/kunlun-engine';
import { Widget, WidgetSubjection } from '@oinone/kunlun-vue-widget';
import { useUploadFileEvent, IUploadMethod } from '@oinone/kunlun-vue-ui-common';
import SmoothSignature from 'smooth-signature';
import { BaseFieldWidget } from '../../../../basic';
import { encrypt } from '../../../../util';
import { FormStringFieldSingleWidget } from '../FormStringFieldSingleWidget';
import FormStringSignatureField from './FormStringSignatureField.vue';

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: ViewType.Form,
    ttype: [ModelFieldType.String, ModelFieldType.Text],
    widget: 'Signature'
  })
)
export class FormStringSignatureFieldWidget extends FormStringFieldSingleWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(FormStringSignatureField);
    return this;
  }

  // 签名画板对象实例
  private smoothSignature: SmoothSignature | undefined = undefined;

  public getSmoothSignature() {
    return this.smoothSignature;
  }

  @Widget.Method()
  public setSmoothSignature(smoothSignature: SmoothSignature) {
    this.smoothSignature = smoothSignature;
  }

  // 是否展示清除按钮
  @Widget.Reactive()
  public get showClearButton() {
    return this.getDsl().showClearButton ?? true;
  }

  // 清除按钮文字
  @Widget.Reactive()
  public get clearButtonText() {
    return this.getDsl().clearButtonText || '清除';
  }

  // 是否展示保存按钮
  @Widget.Reactive()
  public get showSaveButton() {
    return this.getDsl().showClearButton ?? true;
  }

  // 保存按钮文字
  @Widget.Reactive()
  public get saveButtonText() {
    return this.getDsl().saveButtonText || '保存';
  }

  // 签名文字颜色
  @Widget.Reactive()
  public get signatureFontColor() {
    return this.getDsl().signatureFontColor || 'black';
  }

  // 签名背景面板颜色
  @Widget.Reactive()
  public get signatureBackGroundColor() {
    return this.getDsl().signatureBackGroundColor || 'white';
  }

  // 是否展示占位文字
  @Widget.Reactive()
  public showPlaceholder = true;

  // 一旦开始签名，就去掉占位提示
  @Widget.Method()
  public onStart() {
    this.showPlaceholder = false;
  }

  @Widget.Method()
  public onClear() {
    this.smoothSignature?.clear();
    this.change('');
    this.showPlaceholder = true;
  }

  // 清除签名画板流事件
  @Widget.SubContext(Symbol('$$CLEAR'))
  public clearFormStringSignatureFieldSubject!: WidgetSubjection<Record<string, unknown>>;

  // 上传签名图片
  @Widget.Method()
  public async onSaveSignature() {
    return this.load(async () => {
      const base64String = this.smoothSignature?.getPNG()?.split(',')[1] || '';
      const byteCharacters = atob(base64String);
      const byteArray = new Uint8Array(byteCharacters.length);

      // 将解码后的字符转换为二进制数据
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArray[i] = byteCharacters.charCodeAt(i);
      }
      const file = new File([new Blob([byteArray], { type: 'image/png' })], 'FormStringSignatureField', {
        type: 'image/png'
      });

      await useUploadFileEvent({
        file,
        uploadMethod: IUploadMethod.Multipart,
        onSuccess: (result, downloadUrl) => {
          const submitFileObject = result;
          if (submitFileObject && submitFileObject.url) {
            this.change(submitFileObject.url);
          }
        },
        onError: () => {},
        onProgress: () => {}
      });
    });
  }

  public async submit(submitValue: SubmitValue) {
    if (!this.value) {
      // 上传签名图片, 提交 url
      await this.onSaveSignature();
    }

    let finalValue = this.value;
    /**
     * 数据提交的时候，如果判断当前字段是否需要加密
     */
    if (this.crypto && finalValue) {
      finalValue = encrypt(finalValue);
    }
    return SubmitHandler.DEFAULT(this.field, this.itemName, submitValue, finalValue);
  }

  public mounted(): void {
    super.mounted();
    if (this.clearFormStringSignatureFieldSubject.subject.closed) {
      return;
    }
    this.clearFormStringSignatureFieldSubject.subscribe((arg) => {
      this.onClear();
    });
  }

  public unmounted(): void {
    super.unmounted();
    this.clearFormStringSignatureFieldSubject.subject.unsubscribe();
  }
}
