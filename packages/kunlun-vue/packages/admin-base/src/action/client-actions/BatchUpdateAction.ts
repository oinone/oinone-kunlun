import { ActiveRecord, FunctionCache, FunctionMetadata, RuntimeServerAction, SubmitValue } from '@oinone/kunlun-engine';
import { ModelDefaultActionName } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { ClickResult } from '../../typing';
import { FetchUtil } from '../../util';
import { ActionWidget } from '../component';
import { ServerActionWidget } from '../server-actions';

@SPI.ClassFactory(
  ActionWidget.Token({
    name: ModelDefaultActionName.$$internal_BatchUpdate
  })
)
export class BatchUpdateAction extends ServerActionWidget {
  @Widget.Reactive()
  public get disabled() {
    return false;
  }

  protected async submit(action: RuntimeServerAction): Promise<SubmitValue> {
    const data = (await this.submitCallChaining?.syncCall())?.records?.[0];
    if (data == null) {
      console.error('Invalid submit data.');
    }
    const { model } = this;
    return new SubmitValue(
      (this.activeRecords || [])
        .map<ActiveRecord | undefined>((v) => {
          const pksObject = FetchUtil.generatorPksObject(model, v);
          if (!pksObject) {
            console.error('Invalid pks object.');
            return undefined;
          }
          return {
            ...data,
            ...pksObject
          };
        })
        .filter((v) => !!v) as ActiveRecord[]
    );
  }

  protected async executeAction(action: RuntimeServerAction, submitValue: SubmitValue): Promise<ClickResult> {
    let { functionDefinition } = action;
    const { model, fun } = action;
    if (!functionDefinition && fun) {
      functionDefinition = await FunctionCache.get(model, fun);
    }
    if (!functionDefinition) {
      functionDefinition = FunctionMetadata.updateWithFieldBatch;
    }
    return this.executeFunction(functionDefinition, await this.getRequestModelFields(), submitValue.records);
  }
}
