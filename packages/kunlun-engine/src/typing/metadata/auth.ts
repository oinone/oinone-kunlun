import type { ActiveRecord } from '../active-record';
import type { CodeModel } from './base';

export interface AuthRole extends CodeModel, ActiveRecord {
  name?: string;
}
