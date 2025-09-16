import { ActiveRecord } from '../active-record';
import { CodeModel } from './base';

export interface AuthRole extends CodeModel, ActiveRecord {
  name?: string;
}
