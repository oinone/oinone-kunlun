import { RuntimeModelField, translateValueByKey } from '@oinone/kunlun-engine';

export const fullAddressField = [
  {
    data: 'country',
    invisible: 'false',
    label: translateValueByKey('国家'),
    model: 'resource.ResourceCity',
    multi: false,
    name: 'country',
    referenceFields: ['code'],
    references: 'resource.ResourceCountry',
    relationFields: ['countryCode'],
    relationStore: true,
    store: false,
    ttype: 'M2O'
  },
  {
    data: 'province',
    label: translateValueByKey('省/州'),
    model: 'resource.ResourceCity',
    multi: false,
    name: 'province',
    referenceFields: ['code'],
    references: 'resource.ResourceProvince',
    relationFields: ['provinceCode'],
    relationStore: true,
    store: false,
    ttype: 'M2O'
  },
  {
    data: 'city',
    label: translateValueByKey('市'),
    model: 'resource.ResourceStreet',
    multi: false,
    name: 'city',
    referenceFields: ['code'],
    references: 'resource.ResourceCity',
    relationFields: ['cityCode'],
    relationStore: true,
    store: false,
    ttype: 'M2O'
  },
  {
    data: 'district',
    label: translateValueByKey('区/县'),
    model: 'resource.ResourceStreet',
    multi: false,
    name: 'district',
    referenceFields: ['code'],
    references: 'resource.ResourceDistrict',
    relationFields: ['districtCode'],
    relationStore: true,
    store: false,
    ttype: 'M2O'
  },

  {
    data: 'originStreet',
    label: '街道',
    model: 'resource.ResourceAddress',
    multi: false,
    name: 'originStreet',
    referenceFields: ['code'],
    references: 'resource.ResourceStreet',
    relationFields: ['streetCode'],
    relationStore: true,
    store: false,
    ttype: 'M2O'
  }
] as unknown as RuntimeModelField[];
