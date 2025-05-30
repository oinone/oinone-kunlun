import { StandardEventManager } from '@kunlun/shared';
import { ClearCache } from '../../cache';
import { IMultiTabsManager, MultiTabInstance } from './typing';

/**
 * 事件键值
 */
enum EventKeys {
  /**
   * 初始化
   */
  'init' = 'init',
  /**
   * 重置
   */
  'reset' = 'reset',
  /**
   * 添加
   */
  'push' = 'push',
  /**
   * 关闭
   */
  'close' = 'close',
  /**
   * 变化（push/close）
   */
  'change' = 'change',
  /**
   * 激活
   */
  'active' = 'active',
  /**
   * 刷新
   */
  'refresh' = 'refresh'
}

type InitEventHandler = (manager: MultiTabsManager, instance: MultiTabInstance) => void;

type PushEventHandler = InitEventHandler;

type CloseEventHandler = InitEventHandler;

type ChangeEventHandler = InitEventHandler;

type ActiveEventHandler = (
  manager: MultiTabsManager,
  instance: MultiTabInstance,
  lastedInstance: MultiTabInstance
) => void;

type RefreshEventHandler = InitEventHandler;

export class MultiTabsManager extends StandardEventManager<typeof EventKeys> implements IMultiTabsManager {
  public static INSTANCE = new MultiTabsManager();

  private _isInit = false;

  private _keepAlive = false;

  private tabs: MultiTabInstance[] = [];

  protected sortKeys: string[] = [];

  private activeTab: MultiTabInstance | undefined;

  private constructor() {
    super();
    // reject create object
  }

  public get isInit() {
    return this._isInit;
  }

  public setInit(instance: MultiTabInstance) {
    this._isInit = true;
    this.notifyHandler(EventKeys.init, instance);
  }

  public get isKeepAlive() {
    return this._keepAlive;
  }

  public enabledKeepAlive() {
    this._keepAlive = true;
  }

  public disabledKeepAlive() {
    this._keepAlive = false;
  }

  public getTabs(): MultiTabInstance[] {
    const { sortKeys } = this;
    if (sortKeys.length) {
      const targetTabs = [...this.tabs];
      const sortedTabs: MultiTabInstance[] = [];
      for (const sortKey of this.sortKeys) {
        const index = targetTabs.findIndex((v) => v.key === sortKey);
        if (index !== -1) {
          sortedTabs.push(targetTabs[index]);
          targetTabs.splice(index, 1);
        }
      }
      return [...sortedTabs, ...targetTabs];
    }
    return [...this.tabs];
  }

  public setSortKeys(sortKeys: string[]) {
    this.sortKeys = sortKeys;
  }

  public getTab(key: string): MultiTabInstance | undefined {
    return this.tabs.find((v) => v.key === key);
  }

  public getActiveTab(): MultiTabInstance | undefined {
    return this.activeTab;
  }

  public init(instance: MultiTabInstance) {
    this._isInit = true;
    this.tabs = [];
    this.activeTab = undefined;
    this.rawPush(instance, true, false);
    this.notifyHandler(EventKeys.init, instance);
  }

  public reset() {
    this._isInit = false;
    this.tabs = [];
    this.notifyHandler(EventKeys.reset);
  }

  public push(instance: MultiTabInstance, active = true) {
    this.rawPush(instance, active);
  }

  protected rawPush(instance: MultiTabInstance, active = true, notify = true) {
    this.tabs.push(instance);
    if (active || !this.activeTab) {
      this.rawActive(instance, false);
    }
    if (notify) {
      this.notifyHandler(EventKeys.push, instance);
      this.notifyHandler(EventKeys.change, instance);
    }
  }

  public close(key: string) {
    this.operator(key, (target, index) => {
      this.rawClose(target, index);
    });
  }

  protected rawClose(instance: MultiTabInstance, index: number, notify = true) {
    this.tabs.splice(index, 1);
    instance.widget?.onClose?.();
    if (this.activeTab?.key === instance.key) {
      this.activeTab = undefined;
    }
    if (notify) {
      this.notifyHandler(EventKeys.close, instance);
      this.notifyHandler(EventKeys.change, instance);
    }
  }

  public active(key: string) {
    this.operator(key, (target) => {
      this.rawActive(target);
    });
  }

  protected rawActive(instance: MultiTabInstance, notify = true) {
    const lastedInstance = this.activeTab;
    this.activeTab = instance;
    instance.widget?.onActive?.(lastedInstance);
    if (notify) {
      this.notifyHandler(EventKeys.active, instance, lastedInstance);
    }
  }

  /**
   * 关闭当前标签页，并激活上一个标签页
   * @protected
   */
  public closeCurrentTab!: () => void;

  /**
   * 关闭指定标签页，并激活上一个标签页
   * @param tab 需要关闭的标签页
   * @protected
   */
  public closeTab!: (tab: MultiTabInstance) => void;

  public activeTabInstance!: (tab: MultiTabInstance) => void;

  public refresh(key: string, ...args: unknown[]) {
    this.operator(key, (target) => {
      target.widget?.onRefresh?.(...args);
      this.notifyHandler(EventKeys.refresh, target);
    });
  }

  private operator(key: string, fn: (target: MultiTabInstance, index: number) => void) {
    let index: number | undefined;
    const target = this.tabs.find((v, i) => {
      if (v.key === key) {
        index = i;
        return true;
      }
      return false;
    });
    if (target) {
      fn(target, index!);
    } else {
      console.error('Invalid tab key.', key);
    }
  }

  public onInit(fn: InitEventHandler) {
    this.on(EventKeys.init, fn);
  }

  public clearOnInit(fn: InitEventHandler) {
    this.clearOn(EventKeys.init, fn);
  }

  public onReset(fn: InitEventHandler) {
    this.on(EventKeys.init, fn);
  }

  public clearOnReset(fn: InitEventHandler) {
    this.clearOn(EventKeys.init, fn);
  }

  public onPush(fn: PushEventHandler) {
    this.on(EventKeys.push, fn);
  }

  public clearOnPush(fn: PushEventHandler) {
    this.clearOn(EventKeys.push, fn);
  }

  public onClose(fn: CloseEventHandler) {
    this.on(EventKeys.close, fn);
  }

  public clearOnClose(fn: CloseEventHandler) {
    this.clearOn(EventKeys.close, fn);
  }

  public onChange(fn: ChangeEventHandler) {
    this.on(EventKeys.change, fn);
  }

  public clearOnChange(fn: ChangeEventHandler) {
    this.clearOn(EventKeys.change, fn);
  }

  public onActive(fn: ActiveEventHandler) {
    this.on(EventKeys.active, fn);
  }

  public clearOnActive(fn: ActiveEventHandler) {
    this.clearOn(EventKeys.active, fn);
  }

  public onRefresh(fn: RefreshEventHandler) {
    this.on(EventKeys.refresh, fn);
  }

  public clearOnRefresh(fn: RefreshEventHandler) {
    this.clearOn(EventKeys.refresh, fn);
  }
}

ClearCache.register(() => {
  MultiTabsManager.INSTANCE.reset();
});
