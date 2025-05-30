import { IBaseAction, IServerAction, IViewAction } from '@kunlun/meta';

export interface UserLang {
  code: string;
  createDate: string;
  dateFormat: string;
  decimalPoint: string;
  direction: string;
  groupingRule: string;
  id: string;
  installState: boolean;
  isoCode: string;
  name: string;
  thousandsSep: string;
  timeFormat: string;
  weekStart: string;
  writeDate: string;
}

export interface PamirsUser {
  id: string;
  name: string;
  nickname: string;
  realname: string;
  lang?: UserLang;
}

export interface UserInfo {
  pamirsUser: PamirsUser;
  userAvatarAction?: IBaseAction;
  actionGroups: { action: IViewAction[] }[];
}
