import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { BaseFieldWidget, TableObjectFieldWidget } from '../../../../basic';

@SPI.ClassFactory(BaseFieldWidget.Token({ viewType: ViewType.Table, ttype: ModelFieldType.ManyToOne }))
export class TableM2OFieldWidget extends TableObjectFieldWidget {}
