import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { EditorFieldWidget } from '../../../../basic';
import { FormM2OAddressFieldWidget } from '../../../form';

@SPI.ClassFactory(
  EditorFieldWidget.Token({
    viewType: ViewType.Table,
    ttype: ModelFieldType.ManyToOne,
    widget: 'Address'
  })
)
export class TableEditorM2OAddressFieldWidget extends FormM2OAddressFieldWidget {
  protected $$mounted() {
    super.$$mounted();
    this.mountedCallChaining?.unhook(this.path);
    this.mountedProcess();
  }
}
