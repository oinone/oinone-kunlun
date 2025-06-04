import { SPI } from '@oinone/kunlun-spi';
import { ActionType } from '@oinone/kunlun-meta';
import { RuntimeServerAction, SubmitValue } from '@oinone/kunlun-engine';

import { ActionWidget } from '../../component';
import { ClickResult } from '../../../typing';
import { executeMicroFlowTandemMutation } from './server';
import { WorkFlowTandemActionWidget } from '../workflow-tandem-action';

@SPI.ClassFactory(ActionWidget.Token({ actionType: ActionType.Server, widget: ['MicroflowTandemAction'] }))
export class MicroFlowTandemActionWidget extends WorkFlowTandemActionWidget {
  protected async executeAction(action: RuntimeServerAction, submitValue: SubmitValue): Promise<ClickResult> {
    const rst = await executeMicroFlowTandemMutation(
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
