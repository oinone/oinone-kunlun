import { SPI } from '@kunlun/spi';
import { ActionType } from '@kunlun/meta';
import { RuntimeServerAction } from '@kunlun/engine';
import { Widget, WidgetSubjection } from '@kunlun/vue-widget';
import { ActionWidget } from '../../component';
import { ServerActionWidget } from '../ServerActionWidget';
import { ClickResult } from '../../../typing';
import { REFRESH_FORM_DATA } from '../../../basic/constant/state-stream';
import { executeEipTandemMutation } from './server';
import { findTandemActionHostViewName } from '../../../util';

@SPI.ClassFactory(ActionWidget.Token({ actionType: ActionType.Server, widget: 'EipTandemAction' }))
export class EipTandemActionWidget extends ServerActionWidget {
  @Widget.SubContext(REFRESH_FORM_DATA)
  protected reloadFormData$!: WidgetSubjection<boolean>;

  @Widget.Reactive()
  protected get updateData(): boolean {
    return true;
  }

  @Widget.Reactive()
  protected get refreshData(): boolean {
    return false;
  }

  protected async executeAction(action: RuntimeServerAction): Promise<ClickResult> {
    const activeRecord = this.activeRecords?.[0] ?? {};

    const viewName = findTandemActionHostViewName({
      rootRuntimeContext: this.rootRuntimeContext,
      metadataRuntimeContext: this.metadataRuntimeContext,
      isDialog: this.isDialog,
      isDrawer: this.isDrawer
    });

    const rst = await executeEipTandemMutation(
      {
        interfaceName: this.getDsl().interfaceName,
        model: this.model.model,
        viewName,
        actionName: action.name,
        requestData: activeRecord
      },
      action.sessionPath
    );

    if (rst.responseData) {
      let t = setTimeout(() => {
        this.reloadFormData$.subject.next(true);
        clearTimeout(t);
        t = null as any;
      }, 100);

      return rst.responseData;
    }

    return null;
  }
}
