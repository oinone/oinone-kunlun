import { EventCategoryType, EventEngine } from '../typing';

export abstract class AbstractEventEngine<K = string> implements EventEngine<K> {
  private readonly _key: string;

  private readonly _category: EventCategoryType;

  private readonly _type: K;

  private _isActivated: boolean;

  private _isDisposed: boolean;

  protected constructor(category: EventCategoryType, type: K) {
    this._key = this.generatorKey();
    this._category = category;
    this._type = type;
    this._isActivated = false;
    this._isDisposed = false;
  }

  public get key(): string {
    return this._key;
  }

  public get category(): EventCategoryType {
    return this._category;
  }

  public get type(): K {
    return this._type;
  }

  public get isActivated(): boolean {
    return this._isActivated;
  }

  public get isDisposed(): boolean {
    return this._isDisposed;
  }

  public start(): boolean {
    if (this.isActivated) {
      return false;
    }
    this._isActivated = true;
    this.$$start();
    return true;
  }

  protected $$start(): void {}

  public stop(): boolean {
    if (this.isActivated) {
      this._isActivated = false;
      this.$$stop();
      return true;
    }
    return false;
  }

  protected $$stop(): void {}

  public dispose(): boolean {
    if (this.isDisposed) {
      return false;
    }
    if (this.isActivated) {
      this.stop();
    }
    this._isDisposed = true;
    this.$$dispose();
    return true;
  }

  protected $$dispose(): void {}

  protected abstract generatorKey(): string;
}
