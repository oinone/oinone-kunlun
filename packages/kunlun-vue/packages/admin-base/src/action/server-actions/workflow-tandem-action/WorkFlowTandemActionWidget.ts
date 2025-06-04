import { SPI } from '@oinone/kunlun-spi';
import { ActionType } from '@oinone/kunlun-meta';
import { RuntimeServerAction, SubmitValue } from '@oinone/kunlun-engine';
import { Widget } from '@oinone/kunlun-vue-widget';

import { ActionWidget } from '../../component';
import { ServerActionWidget } from '../ServerActionWidget';
import { ClickResult } from '../../../typing';
import { executeWorkflowTandemMutation } from './server';

@SPI.ClassFactory(
  ActionWidget.Token({ actionType: ActionType.Server, widget: ['WorkflowTandemAction', 'DataflowTandemAction'] })
)
export class WorkFlowTandemActionWidget extends ServerActionWidget {
  @Widget.Reactive()
  protected get updateData(): boolean {
    return false;
  }

  @Widget.Reactive()
  protected get refreshData(): boolean {
    return false;
  }

  protected async executeAction(action: RuntimeServerAction, submitValue: SubmitValue): Promise<ClickResult> {
    const rst = await executeWorkflowTandemMutation(
      {
        workflowCode: this.getDsl().workflowCode,
        model: this.model.model,
        modelDataList: this.activeRecords || []
      },
      action.sessionPath
    );

    return null;
  }
}
