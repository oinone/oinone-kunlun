import { InternalOperator } from './internal-operator';

export type StorageKey = string | symbol;

export interface Storage<V> {
  key: StorageKey;
  operator: InternalOperator<V>;
}
