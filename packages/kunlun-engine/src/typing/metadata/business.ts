import { BizCodeModel } from './base';

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

export interface PamirsCompany extends BizCodeModel {
  name?: string;
  /**
   * {@link StaffSize}
   */
  logoUrl?: string;
  staffSize?: string;
  licenseRegisterTime?: string;
  responsiblePerson?: PamirsEmployee;
  responsiblePersonCode?: string;
}

export interface PamirsDepartment extends BizCodeModel {
  name?: string;
}

export interface PamirsEmployee extends BizCodeModel {
  name?: string;
}
