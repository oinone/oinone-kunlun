import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { EditorFieldWidget } from '../../../../basic';
import { FormM2MEmployeeFieldWidget } from '../../../form';

@SPI.ClassFactory(
  EditorFieldWidget.Token({
    viewType: ViewType.Table,
    ttype: ModelFieldType.ManyToMany,
    widget: 'Employee'
  })
)
export class TableEditorM2MEmployeeFieldWidget extends FormM2MEmployeeFieldWidget {}
