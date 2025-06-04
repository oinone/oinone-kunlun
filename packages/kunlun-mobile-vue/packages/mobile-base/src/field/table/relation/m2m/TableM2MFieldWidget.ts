import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { BaseFieldWidget, TableListFieldWidget } from '../../../../basic';

@SPI.ClassFactory(BaseFieldWidget.Token({ viewType: ViewType.Table, ttype: ModelFieldType.ManyToMany }))
export class TableM2MFieldWidget extends TableListFieldWidget {}
