import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { BaseFieldWidget, TableListFieldWidget } from '../../../../basic';

@SPI.ClassFactory(BaseFieldWidget.Token({ viewType: ViewType.Table, ttype: ModelFieldType.OneToMany }))
export class TableO2MFieldWidget extends TableListFieldWidget {}
