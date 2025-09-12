import { ActiveRecord } from '../active-record';

export interface IdModel extends ActiveRecord {
  id?: string;
}

export interface CodeModel extends IdModel {
  code?: string;
}

export interface BizIdModel extends IdModel {
  createUserName?: string;
  writeUserName?: string;
}

export interface BizCodeModel extends CodeModel {
  createUserName?: string;
  writeUserName?: string;
}
