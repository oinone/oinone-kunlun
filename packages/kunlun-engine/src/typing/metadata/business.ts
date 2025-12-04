import { DataStatusEnum } from '@oinone/kunlun-meta';
import { ActiveRecord } from '../active-record';
import { BizModel, NameCodeModel, TreeModel } from './base';

export enum StaffSize {
  SS_1_9 = '1-9',
  SS_10_20 = '10-20',
  SS_21_50 = '21-50',
  SS_51_100 = '51-100',
  SS_101_200 = '101-200',
  SS_201_500 = '201-500',
  SS_501_2000 = '501-2000',
  SS_2000 = '>2000'
}

export interface PamirsCompany extends NameCodeModel, TreeModel, BizModel, ActiveRecord {
  name?: string;
  /**
   * {@link StaffSize}
   */
  staffSize?: string;
  logoUrl?: string;
  licenseRegisterTime?: string;
  responsiblePerson?: PamirsEmployee;
  responsiblePersonCode?: string;

  parent?: PamirsCompany;

  departmentList?: PamirsDepartment[];

  employeeList?: PamirsEmployee[];
}

export interface PamirsDepartment extends NameCodeModel, TreeModel, BizModel, ActiveRecord {
  description?: string;
  dataStatus?: DataStatusEnum;

  parent?: PamirsDepartment;

  companyCode?: string;
  company?: PamirsCompany;

  positionList?: PamirsPosition[];

  employeeList?: PamirsEmployee[];
}

export interface PamirsPosition extends NameCodeModel, TreeModel, BizModel, ActiveRecord {
  dataStatus?: DataStatusEnum;

  parent?: PamirsPosition;

  companyCode?: string;
  company?: PamirsCompany;

  departmentCode?: string;
  department?: PamirsDepartment;

  employeeList?: PamirsEmployee[];
}

export interface PamirsEmployee extends NameCodeModel, BizModel, ActiveRecord {}

export enum OrganizationalStructureType {
  company = 'company',
  department = 'department'
}

export interface PamirsOrganizationalStructure extends NameCodeModel, TreeModel, BizModel, ActiveRecord {
  type: OrganizationalStructureType;
  parentType?: OrganizationalStructureType;
}
