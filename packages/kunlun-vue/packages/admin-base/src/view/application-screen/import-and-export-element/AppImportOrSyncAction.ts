import { SPI } from '@oinone/kunlun-spi';
import { ActionWidget } from '../../../action/component/action/ActionWidget';
import { ActionType, ViewType } from '@oinone/kunlun-meta';
import { ServerActionWidget } from '../../../action/server-actions';
import { ActiveRecord, ViewActionCache, executeViewAction } from '@oinone/kunlun-engine';

@SPI.ClassFactory(
  ActionWidget.Token({
    actionType: ActionType.Server,
    viewType: ViewType.Detail,
    name: ['export', 'sync'],
    model: [
      'dmeta.ModelDesignerMetaExport',
      'dmeta.UIDesignerMetaExport',
      'dmeta.WFDesignerMetaExport',
      'dmeta.MFDesignerMetaExport',
      'dmeta.EipDesignerMetaExport',
      'dmeta.DataDesignerMetaExport',
      'dmeta.PrintDesignerMetaExport'
    ]
  })
)
export class AppImportOrExportAction extends ServerActionWidget {
  protected historyBack() {
    ViewActionCache.get('apps.AppsManagementModule', 'homepage').then((action) => {
      executeViewAction({
        ...action!,
        resModuleName: 'apps'
      });
    });
  }

  protected executeFunction<T>(functionDefinition, requestFields, activeRecords): Promise<T> {
    const fieldActiveRecord = (this.getParentWidget()?.getParentWidget()! as any).fieldActiveRecord as Map<
      string,
      ActiveRecord[]
    >;

    const activeRecord = this.activeRecords ? this.activeRecords[0] : {};

    const formData = {
      ...activeRecord
    };

    for (const [key, value] of fieldActiveRecord.entries()) {
      formData[key] = value.map((v) => ({ id: v.id }));
    }

    return super.executeFunction(functionDefinition, requestFields, formData);
  }
}
