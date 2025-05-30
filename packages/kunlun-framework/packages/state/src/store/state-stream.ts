import { BehaviorSubject, map, distinctUntilChanged, debounceTime } from '../operators';

class StateStream<StateType extends { [key: string]: any } = {}> {
  public value$: BehaviorSubject<StateType>;

  private _contextValue!: StateType;

  public constructor(initialValue: Partial<StateType>) {
    this._contextValue = initialValue as StateType;
    this.value$ = new BehaviorSubject<StateType>(initialValue as StateType);
  }

  public initValue(inc: StateType) {
    this._contextValue = inc;
    this.value$.next(inc);
  }

  public setValue(key: keyof StateType, value: any) {
    const newValue: StateType = {
      ...this._contextValue,
      [key]: value
    };
    this._contextValue = newValue;
    this.value$.next(newValue);
  }

  public setValues(inc: Partial<StateType>) {
    const newValue: StateType = {
      ...this._contextValue,
      ...inc
    };
    this._contextValue = newValue;

    this.value$.next(newValue);
  }

  public getContext() {
    return this._contextValue as Readonly<StateType>;
  }

  public getValues<K extends keyof StateType>(keys: K[]) {
    return keys.map((k) => this._contextValue[k]);
  }

  public getValueByKey<K extends keyof StateType>(key: K) {
    return this._contextValue[key];
  }

  public pluck<K extends keyof StateType>(key: K) {
    const content$ = this.value$.pipe(
      map((context) => context[key]),
      distinctUntilChanged((x, y) => x === y)
    );
    return content$;
  }

  public pluckSome<K extends keyof StateType>(keys: K[]) {
    const content$ = this.value$.pipe(
      map((context) => keys.map((k) => context[k])),
      distinctUntilChanged((x, y) => x === y)
    );
    return content$;
  }

  public subscribe(callback: (value: StateType) => void) {
    this.value$.pipe(debounceTime(1)).subscribe(callback);
  }

  public unsubscribe() {
    this.value$ && this.value$.unsubscribe();
  }
}

export { StateStream };
