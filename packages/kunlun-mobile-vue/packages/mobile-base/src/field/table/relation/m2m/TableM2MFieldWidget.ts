import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { BaseFieldWidget, TableListFieldWidget } from '../../../../basic';

@SPI.ClassFactory(BaseFieldWidget.Token({ viewType: ViewType.Table, ttype: ModelFieldType.ManyToMany }))
export class TableM2MFieldWidget extends TableListFieldWidget {}
