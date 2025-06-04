import { translateValueByKey } from '@oinone/kunlun-engine';
import { Widget } from '@oinone/kunlun-vue-widget';
import { UploadFile } from 'ant-design-vue';
import { FileModel, getEasyImportTemplate } from '@oinone/kunlun-vue-ui-common';
import { FormWidget } from '../../form';
import TranslateUpload from './TranslateUpload.vue';

export abstract class TranslateUploadBaseWidget extends FormWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(TranslateUpload);
    return this;
  }

  @Widget.Reactive()
  protected uploadIcon = 'oinone-shangchuan4';

  @Widget.Reactive()
  protected uploadTitle = translateValueByKey('点击/拖拽单个或批量文件上传');

  @Widget.Reactive()
  protected uploadDesc = translateValueByKey('支持上传格式为xls、xlsx、csv文件');

  @Widget.Reactive()
  protected uploadFile: UploadFile | undefined;

  @Widget.Reactive()
  public get workbookId() {
    return this.formData.workbookId;
  }

  @Widget.Reactive()
  protected templateUrl: string | undefined;

  @Widget.Watch('workbookId')
  protected async getImportTemplateUrl(workbookId) {
    const data = await getEasyImportTemplate(workbookId);
    if (data?.redirectUri) {
      this.templateUrl = data.redirectUri as string;
    }
  }

  protected abstract handleUpload(file: FileModel): Promise<unknown>;
}
