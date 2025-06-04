import { StandardEventHandler, StandardEventManager } from '@oinone/kunlun-shared';
import { IPopupInstance, IPopupManager } from './typing';
import { RuntimeAction } from '../../runtime-metadata';

/**
 * 事件键值
 */
export enum EventKeys {
  /**
   * 添加
   */
  push = 'push',
  /**
   * 创建
   */
  created = 'created',
  /**
   * 打开
   */
  open = 'open',
  /**
   * 关闭
   */
  close = 'close',
  /**
   * 销毁
   */
  dispose = 'dispose',
  /**
   * 销毁
   */
  disposeAll = 'disposeAll'
}

type PushEventHandler = <Action extends RuntimeAction = RuntimeAction>(
  manager: PopupManager,
  instance: IPopupInstance,
  action?: Action
) => void;

export type CreatedEventHandler = PushEventHandler;

export type OpenEventHandler = PushEventHandler;

export type CloseEventHandler = PushEventHandler;

export type DisposeEventHandler = PushEventHandler;

export type DisposeAllEventHandler = (manager: PopupManager) => void;

type OperatorFunction = (target: IPopupInstance, index: number) => void;

export class PopupManager extends StandardEventManager<typeof EventKeys> implements IPopupManager {
  public static INSTANCE = new PopupManager();

  private instances: IPopupInstance[] = [];

  private constructor() {
    super();
    // reject create object
  }

  public getInstances(type?: string): IPopupInstance[] {
    if (type) {
      return [...this.instances].filter((v) => v.type === type);
    }
    return [...this.instances];
  }

  public getInstance(handle: string): IPopupInstance | undefined {
    return this.instances.find((v) => v.key === handle);
  }

  public peek(type?: string): IPopupInstance | undefined {
    const instances = this.getInstances(type);
    return instances[instances.length - 1];
  }

  public push(instance: IPopupInstance, open = true) {
    this.rawPush(instance, open);
  }

  protected rawPush(instance: IPopupInstance, open = true, notify = true) {
    this.instances.push(instance);
    if (notify) {
      this.notifyHandler(EventKeys.push, instance);
    }
    if (open) {
      this.rawOpen(instance, notify);
    }
  }

  public open(key: string): void {
    this.operator(key, (target) => {
      this.rawOpen(target);
    });
  }

  protected rawOpen(instance: IPopupInstance, notify = true) {
    if (instance.widget?.isVisible) {
      return;
    }
    instance.widget?.onVisibleChange(true);
    if (notify) {
      this.notifyHandler(EventKeys.open, instance);
    }
  }

  public close(key: string): void {
    this.operator(key, (target) => {
      this.rawClose(target);
    });
  }

  protected rawClose(instance: IPopupInstance, notify = true) {
    if (!instance.widget?.isVisible) {
      return;
    }
    instance.widget?.onVisibleChange(false);
    if (notify) {
      this.notifyHandler(EventKeys.close, instance);
    }
  }

  public dispose<Action extends RuntimeAction = RuntimeAction>(key?: string, triggerAction?: Action): void {
    this.operator(key, (target, index) => {
      this.rawDispose(target, index, true, triggerAction);
    });
  }

  protected rawDispose<Action extends RuntimeAction = RuntimeAction>(
    instance: IPopupInstance,
    index: number,
    notify = true,
    triggerAction?: Action
  ) {
    const { widget } = instance;
    if (widget) {
      widget.onVisibleChange(false, triggerAction);
      widget.dispose();
    }
    this.instances.splice(index, 1);
    if (notify) {
      this.notifyHandler(EventKeys.dispose, instance, triggerAction);
    }
  }

  public disposeAll(type?: string): void {
    for (let i = this.instances.length - 1; i >= 0; i--) {
      const instance = this.instances[i];
      if (!type || instance.type === type) {
        this.rawDispose(instance, i);
      }
    }
    this.notifyHandler(EventKeys.disposeAll);
  }

  private operator(key: string | undefined, fn: OperatorFunction) {
    let target: IPopupInstance | undefined;
    let index: number | undefined;
    if (key) {
      target = this.instances.find((v, i) => {
        if (v.key === key) {
          index = i;
          return true;
        }
        return false;
      });
    } else {
      target = this.peek();
      if (target) {
        index = this.instances.length - 1;
      }
    }
    if (target) {
      fn(target, index!);
    } else {
      console.error('Invalid tab key.', key);
    }
  }

  public onPush(fn: PushEventHandler) {
    this.on(EventKeys.push, fn as StandardEventHandler);
  }

  public clearOnPush(fn: PushEventHandler) {
    this.clearOn(EventKeys.push, fn as StandardEventHandler);
  }

  public onCreated(fn: CreatedEventHandler) {
    this.on(EventKeys.created, fn as StandardEventHandler);
  }

  public clearOnCreated(fn: CreatedEventHandler) {
    this.clearOn(EventKeys.created, fn as StandardEventHandler);
  }

  public onOpen(fn: OpenEventHandler) {
    this.on(EventKeys.open, fn as StandardEventHandler);
  }

  public clearOnOpen(fn: OpenEventHandler) {
    this.clearOn(EventKeys.open, fn as StandardEventHandler);
  }

  public onClose(fn: CloseEventHandler) {
    this.on(EventKeys.close, fn as StandardEventHandler);
  }

  public clearOnClose(fn: CloseEventHandler) {
    this.clearOn(EventKeys.close, fn as StandardEventHandler);
  }

  public onDispose(fn: DisposeEventHandler) {
    this.on(EventKeys.dispose, fn as StandardEventHandler);
  }

  public clearOnDispose(fn: DisposeEventHandler) {
    this.clearOn(EventKeys.dispose, fn as StandardEventHandler);
  }

  public onDisposeAll(fn: DisposeAllEventHandler) {
    this.on(EventKeys.disposeAll, fn as StandardEventHandler);
  }

  public clearOnDisposeAll(fn: DisposeAllEventHandler) {
    this.clearOn(EventKeys.disposeAll, fn as StandardEventHandler);
  }
}
