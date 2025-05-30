import { ActiveRecord } from '@kunlun/engine';

export interface ResourceAddress extends ActiveRecord {
  id?: string;

  countryCode?: string;
  countryName?: string;
  originCountry?: ResourceCountry;

  provinceCode?: string;
  provinceName?: string;
  originProvince?: ResourceProvince;

  cityCode?: string;
  cityName?: string;
  originCity?: ResourceCity;

  districtCode?: string;
  districtName?: string;
  originDistrict?: ResourceDistrict;

  streetCode?: string;
  streetName?: string;
  originStreet?: ResourceStreet;

  /**
   * 详细地址
   */
  street2?: string;

  /**
   * 完整地址
   */
  fullAddress?: string;
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
