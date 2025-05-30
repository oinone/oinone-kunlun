import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { ModelFieldType, ViewType } from '@kunlun/meta';
import { FormFieldWidget } from '../../../../basic';
import { FormM2OConstructSelectFieldWidget } from '../../../../field';
import UploadAndSelectView from './UploadAndSelect.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search, ViewType.Detail],
    ttype: ModelFieldType.ManyToOne,
    widget: ['PaaSInstallSelect']
  })
)
export class PaaSInstallConstructSelectFieldWidget extends FormM2OConstructSelectFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(UploadAndSelectView);
    return this;
  }

  @Widget.Reactive()
  private uploadImgUrl!: string;

  protected async mounted() {
    super.mounted();
    this.uploadImgUrl = this.formData.icon as string;
  }
}
