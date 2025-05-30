import { UserTablePrefer } from './user-prefer';

export interface VisibleField {
  displayName?: string;
  data: string;
  checked?: boolean;
}

export interface OperateEntity {
  visibleFields?: VisibleField[];
  prefer?: UserTablePrefer;
  inline?: boolean;
}
