import { ActiveRecord } from '@oinone/kunlun-engine';

export interface ResourceAddress extends ActiveRecord {
  id?: string;

  countryCode?: string | null;
  countryName?: string | null;
  originCountry?: ResourceCountry;

  provinceCode?: string | null;
  provinceName?: string | null;
  originProvince?: ResourceProvince;

  cityCode?: string | null;
  cityName?: string | null;
  originCity?: ResourceCity;

  districtCode?: string | null;
  districtName?: string | null;
  originDistrict?: ResourceDistrict;

  streetCode?: string | null;
  streetName?: string | null;
  originStreet?: ResourceStreet;

  /**
   * 详细地址
   */
  street2?: string | null;

  /**
   * 完整地址
   */
  fullAddress?: string | null;
}

export interface ResourceCountry extends ActiveRecord {
  id?: string;
  code?: string;
  name?: string;

  phoneCode?: string;
}

export interface ResourceProvince extends ActiveRecord {
  id?: string;
  code?: string;
  name?: string;
}

export interface ResourceCity extends ActiveRecord {
  id?: string;
  code?: string;
  name?: string;
}

export interface ResourceDistrict extends ActiveRecord {
  id?: string;
  code?: string;
  name?: string;
}

export interface ResourceStreet extends ActiveRecord {
  id?: string;
  code?: string;
  name?: string;
}

export interface ResourceRegion extends ActiveRecord {
  id?: string;
  type?: AddressTypeEnum;
  code?: string | null;
  name?: string | null;
  pCode?: string;
  parent?: ResourceRegion;
}

export enum AddressTypeEnum {
  Country = 'Country',
  Province = 'Province',
  City = 'City',
  District = 'District',
  Street = 'Street'
}
