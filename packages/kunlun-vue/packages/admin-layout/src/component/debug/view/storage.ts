import { RuntimeContext, RuntimeViewAction, ViewActionQueryParameter } from '@kunlun/engine';
import { StandardEventManager } from '@kunlun/shared';
import { DebugRequestInfo } from '../typing';

enum EventKeys {
  'update' = 'update'
}

type UpdateEventHandler = (storage: DebugInfoStorage) => void;

export class DebugInfoStorage extends StandardEventManager<typeof EventKeys> {
  public static INSTANCE = new DebugInfoStorage();

  public pageParameters?: ViewActionQueryParameter;

  public viewAction?: RuntimeViewAction;

  public requestInfo?: DebugRequestInfo;

  public responseData?: string;

  public runtimeContext?: RuntimeContext;

  public forceUpdate(): void {
    this.notifyHandler(EventKeys.update);
  }

  public onUpdate(fn: UpdateEventHandler) {
    this.on(EventKeys.update, fn);
  }

  public clearOnUpdate(fn: UpdateEventHandler) {
    this.clearOn(EventKeys.update, fn);
  }
}
