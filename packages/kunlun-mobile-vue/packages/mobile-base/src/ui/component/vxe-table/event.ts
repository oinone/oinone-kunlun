import { SortDirection } from '@kunlun/shared';

export interface SortChangeEvent {
  origin: unknown;

  field: string;
  direction: SortDirection;

  sorts: {
    origin: unknown;

    field: string;
    direction: SortDirection;
  }[];
}

export interface CheckedChangeEvent<T = Record<string, unknown>> {
  origin: unknown;

  checked: boolean;
  record?: T;
  records: T[];
}

export interface RadioChangeEvent<T = Record<string, unknown>> {
  origin: unknown;

  oldRecord: T;
  newRecord: T;
}
