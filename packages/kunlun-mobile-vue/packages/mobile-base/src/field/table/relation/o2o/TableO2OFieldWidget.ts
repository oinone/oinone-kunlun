import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { BaseFieldWidget, TableObjectFieldWidget } from '../../../../basic';

@SPI.ClassFactory(BaseFieldWidget.Token({ viewType: ViewType.Table, ttype: ModelFieldType.OneToOne }))
export class TableO2OFieldWidget extends TableObjectFieldWidget {}
