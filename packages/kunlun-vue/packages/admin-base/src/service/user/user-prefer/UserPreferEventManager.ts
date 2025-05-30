import { BlockingEventManager } from '@kunlun/shared';
import { UserTablePrefer } from '../../../typing';

enum EventKeys {
  reload = 'reload',
  save = 'save'
}

type ReloadEventHandler = (userPrefer: UserTablePrefer) => void;

type SaveEventHandler = ReloadEventHandler;

export class UserPreferEventManager extends BlockingEventManager<typeof EventKeys> {
  private static INSTANCES = new Map<string, UserPreferEventManager>();

  private readonly key: string;

  private data: UserTablePrefer | undefined;

  private constructor(key: string) {
    super();
    this.key = key;
  }

  public static get(key: string): UserPreferEventManager {
    let instance = UserPreferEventManager.INSTANCES.get(key);
    if (!instance) {
      instance = new UserPreferEventManager(key);
      UserPreferEventManager.INSTANCES.set(key, instance);
    }
    return instance;
  }

  public static getNullable(key: string): UserPreferEventManager | undefined {
    return UserPreferEventManager.INSTANCES.get(key);
  }

  public setData(data: UserTablePrefer | undefined): void {
    this.data = data;
  }

  public getData(): UserTablePrefer | undefined {
    return this.data;
  }

  public async reload(userPrefer: Partial<UserTablePrefer>): Promise<void> {
    await this.notifyHandler(EventKeys.reload, userPrefer);
  }

  public onReload(fn: ReloadEventHandler, priority?: number) {
    this.on(EventKeys.reload, fn, priority);
  }

  public clearOnReload(fn: ReloadEventHandler) {
    this.clearOn(EventKeys.reload, fn);
  }

  public async save(userPrefer: Partial<UserTablePrefer>): Promise<void> {
    await this.notifyHandler(EventKeys.save, userPrefer);
  }

  public onSave(fn: SaveEventHandler) {
    this.on(EventKeys.save, fn);
  }

  public clearOnSave(fn: SaveEventHandler) {
    this.clearOn(EventKeys.save, fn);
  }

  public dispose(): boolean {
    return UserPreferEventManager.INSTANCES.delete(this.key);
  }
}
