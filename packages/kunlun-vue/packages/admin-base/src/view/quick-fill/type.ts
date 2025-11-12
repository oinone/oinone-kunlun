export enum QuickFillType {
  create = 'create',
  update = 'update'
}

export const NON_CUT = 'NON_CUT';

export interface TableFieldOption {
  label: string;
  key: string;
  value: string;
  readonly: boolean;
  field?: string;
}
