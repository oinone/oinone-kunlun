import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { EditorFieldWidget } from '../../../../basic';
import { FormM2OEmployeeFieldWidget } from '../../../form';

@SPI.ClassFactory(
  EditorFieldWidget.Token({
    viewType: ViewType.Table,
    ttype: ModelFieldType.ManyToOne,
    widget: 'Employee'
  })
)
export class TableEditorM2OEmployeeFieldWidget extends FormM2OEmployeeFieldWidget {}
