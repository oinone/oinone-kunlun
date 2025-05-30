import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { FormFieldWidget } from '../../../../basic';
import { FormStringFieldWidget } from '../FormStringFieldWidget';
import DefaultDownload from './DefaultDownload.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Form,
    ttype: [ModelFieldType.String, ModelFieldType.Text],
    widget: 'Download'
  })
)
export class FormStringDownloadFieldWidget extends FormStringFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultDownload);
    return this;
  }

  // 下载提示文本前缀
  @Widget.Reactive()
  public get linkDisplayTextPrefix() {
    return this.getDsl().linkDisplayTextPrefix;
  }

  // 下载提示文本
  @Widget.Reactive()
  public get linkDisplayText() {
    return this.getDsl().linkDisplayText || this.value;
  }

  // 下载的文件名
  @Widget.Reactive()
  public get downloadFileName() {
    return this.getDsl().downloadFileName;
  }

  // 点击下载事件
  @Widget.Method()
  public async onDownload(e: Event) {
    e.preventDefault();
    if (!this.value || this.disabled) {
      return;
    }

    try {
      // 发起请求获取文件数据
      const response = await fetch(this.value, { mode: 'cors' });
      if (!response.ok) {
        throw new Error('网络响应错误');
      }
      // 将响应转为 Blob 对象
      const blob = await response.blob();

      // 创建一个本地 URL
      const url = URL.createObjectURL(blob);

      // 创建一个临时a标签并设置download属性
      const a = document.createElement('a');
      a.href = url;
      a.download = this.downloadFileName || this.value.substring(this.value.lastIndexOf('/') + 1);

      // 模拟点击下载文件
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // 释放Blob URL资源
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('下载文件失败：', error);
    }
  }
}
