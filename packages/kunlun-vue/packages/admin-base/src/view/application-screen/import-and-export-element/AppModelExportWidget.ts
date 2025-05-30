import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';

import { BaseElementWidget } from '../../../basic';
import { TableWidget } from '../../table';
import { ViewType } from '@kunlun/meta';
import { ActiveRecord } from '@kunlun/engine';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    viewType: ViewType.Table,
    widget: ['table', 'Table'],
    model: ['dmeta.ModelDesignerModelMetaExport']
  })
)
export class AppModelExportWidget extends TableWidget {
  @Widget.Reactive()
  public get showDataSource(): ActiveRecord[] | undefined {
    return this.dataSource;
  }
}
