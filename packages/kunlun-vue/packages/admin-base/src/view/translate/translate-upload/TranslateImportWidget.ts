import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FileModel } from '@oinone/kunlun-vue-ui-common';
import { FormWidget } from '../../form';
import { TranslateUploadBaseWidget } from './TranslateUploadBaseWidget';
import { mutateTranslateFile } from '../service';

@SPI.ClassFactory(
  FormWidget.Token({
    widget: 'translationImport'
  })
)
export class TranslateImportWidget extends TranslateUploadBaseWidget {
  public initialize(props) {
    super.initialize(props);
    return this;
  }

  @Widget.Method()
  protected async handleUpload(file: FileModel) {
    return mutateTranslateFile(file, this.workbookId);
  }
}
