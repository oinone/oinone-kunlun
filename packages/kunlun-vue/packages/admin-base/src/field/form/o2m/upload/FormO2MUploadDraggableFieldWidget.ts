import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { translateValueByKey } from '@oinone/kunlun-engine';
import { FormFieldWidget } from '../../../../basic';
import { UploadDraggable } from '../../../../components';
import { FormO2MUploadFieldWidget } from './FormO2MUploadFieldWidget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Detail, ViewType.Gallery],
    ttype: ModelFieldType.OneToMany,
    widget: 'UploadDraggable'
  })
)
export class FormO2MUploadDraggableFieldWidget extends FormO2MUploadFieldWidget {
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
