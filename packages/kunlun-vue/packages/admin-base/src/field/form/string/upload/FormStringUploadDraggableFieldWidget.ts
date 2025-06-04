import { translateValueByKey } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { BaseFieldWidget } from '../../../../basic';
import { UploadDraggable } from '../../../../components';
import { FormStringUploadFieldWidget } from './FormStringUploadFieldWidget';

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: ViewType.Form,
    ttype: [ModelFieldType.String, ModelFieldType.Text],
    widget: 'UploadDraggable'
  })
)
export class FormStringUploadDraggableFieldWidget extends FormStringUploadFieldWidget {
  public initialize(config) {
    super.initialize(config);
    this.setComponent(UploadDraggable);
    return this;
  }

  // 拖拽上传图标
  @Widget.Reactive()
  public get draggableIcon() {
    return this.getDsl().draggableIcon || 'oinone-shangchuan1';
  }

  // 拖拽上传提示词
  @Widget.Reactive()
  public get draggableTipText() {
    return this.getDsl().draggableTipText || '点击 或 拖拽文件到这里上传';
  }

  // 是否展示支持拓展名
  @Widget.Reactive()
  public get showDraggableExtendsionsText() {
    return this.getDsl().showDraggableExtendsionsText ?? true;
  }

  // 允许上传的文件类型提示文本
  @Widget.Reactive()
  public get draggableExtendsionsText() {
    const allowdFileExtensionsString = this.limitFileExtensions || translateValueByKey('全部');
    return translateValueByKey('支持拓展名: ') + allowdFileExtensionsString;
  }
}
