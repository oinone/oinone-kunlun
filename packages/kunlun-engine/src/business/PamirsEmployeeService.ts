import { ServiceIdentifier } from '@oinone/kunlun-spi';
import { ListModelApi } from '../service';
import { PamirsEmployee } from '../typing';

export interface PamirsEmployeeQueryFilter {
  domain?: string;
  employeeCodes?: string[];
  departmentCodes?: string[];
  roleCodes?: string[];
  userEmployee?: boolean;
  userDept?: boolean;
  userDeptAndChildren?: boolean;
}

export interface PamirsEmployeeService extends ListModelApi<PamirsEmployee> {
  queryListByFilter(query: PamirsEmployeeQueryFilter): Promise<PamirsEmployee[]>;
}

export const PamirsEmployeeMetadata = {
  MODEL_MODEL: 'business.PamirsEmployee',
  MODEL_NAME: 'pamirsEmployee'
};

export const PamirsEmployeeServiceToken = ServiceIdentifier<PamirsEmployeeService>('PamirsEmployeeService');
