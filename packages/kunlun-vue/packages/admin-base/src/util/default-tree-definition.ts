import { XMLParse } from '@oinone/kunlun-dsl';
import { ExperimentalConfigManager } from '@oinone/kunlun-engine';
import { TreeNodeMetadata } from '../typing';
import { TreeUtils } from './tree-utils';

const defaultAddressTemplate = XMLParse.INSTANCE.parse(`<template>
  <nodes>
    <node model="resource.ResourceCountry" label="activeRecord.name" labelFields="name" submit-countryCode="code" submit-countryName="name" />
    <node model="resource.ResourceProvince" label="activeRecord.name" labelFields="name" references="country" submit-provinceCode="code" submit-provinceName="name" />
    <node model="resource.ResourceCity" label="activeRecord.name" labelFields="name" references="province" submit-cityCode="code" submit-cityName="name" />
    <node model="resource.ResourceDistrict" label="activeRecord.name" labelFields="name" references="city" submit-districtCode="code" submit-districtName="name" />
    <node model="resource.ResourceStreet" label="activeRecord.name" labelFields="name" references="district" submit-streetCode="code" submit-streetName="name" />
  </nodes>
</template>
`);

const defaultAddressTemplate1 = XMLParse.INSTANCE.parse(`<template>
  <nodes>
    <node model="resource.ResourceCountry" label="activeRecord.name" labelFields="name" submit-countryCode="code" submit-countryName="name" />
    <node model="resource.ResourceProvince" label="activeRecord.name" labelFields="name" references="country" submit-provinceCode="code" submit-provinceName="name" />
    <node model="resource.ResourceCity" label="activeRecord.name" labelFields="name" references="province" submit-cityCode="code" submit-cityName="name" />
    <node model="resource.ResourceDistrict" label="activeRecord.name" labelFields="name" references="city" submit-districtCode="code" submit-districtName="name" />
  </nodes>
</template>
`);

const defaultAddressTemplate2 = XMLParse.INSTANCE.parse(`<template>
  <nodes>
    <node model="resource.ResourceProvince" label="activeRecord.name" labelFields="name" submit-provinceCode="code" submit-provinceName="name" />
    <node model="resource.ResourceCity" label="activeRecord.name" labelFields="name" references="province" submit-cityCode="code" submit-cityName="name" />
    <node model="resource.ResourceDistrict" label="activeRecord.name" labelFields="name" references="city" submit-districtCode="code" submit-districtName="name" />
    <node model="resource.ResourceStreet" label="activeRecord.name" labelFields="name" references="district" submit-streetCode="code" submit-streetName="name" />
  </nodes>
</template>
`);

const defaultAddressTemplate3 = XMLParse.INSTANCE.parse(`<template>
  <nodes>
    <node model="resource.ResourceProvince" label="activeRecord.name" labelFields="name" submit-provinceCode="code" submit-provinceName="name" />
    <node model="resource.ResourceCity" label="activeRecord.name" labelFields="name" references="province" submit-cityCode="code" submit-cityName="name" />
    <node model="resource.ResourceDistrict" label="activeRecord.name" labelFields="name" references="city" submit-districtCode="code" submit-districtName="name" />
  </nodes>
</template>
`);

const defaultAddressTemplateNext = XMLParse.INSTANCE.parse(`<template>
  <nodes>
    <node model="resource.ResourceRegion" label="activeRecord.name" labelFields="name" selfReferences="parent" />
  </nodes>
</template>
`);

const defaultAddressTemplateNext1 = XMLParse.INSTANCE.parse(`<template>
  <nodes>
    <node model="resource.ResourceRegion" label="activeRecord.name" labelFields="name" />
    <node model="resource.ResourceRegion" label="activeRecord.name" labelFields="name" references="parent"/>
    <node model="resource.ResourceRegion" label="activeRecord.name" labelFields="name" references="parent"/>
    <node model="resource.ResourceRegion" label="activeRecord.name" labelFields="name" references="parent"/>
  </nodes>
</template>
`);

const defaultAddressTemplateNext2 = XMLParse.INSTANCE.parse(`<template>
  <nodes>
    <node model="resource.ResourceRegion" label="activeRecord.name" labelFields="name" filter="type == 'Province'"/>
    <node model="resource.ResourceRegion" label="activeRecord.name" labelFields="name" references="parent"/>
    <node model="resource.ResourceRegion" label="activeRecord.name" labelFields="name" references="parent"/>
    <node model="resource.ResourceRegion" label="activeRecord.name" labelFields="name" references="parent"/>
  </nodes>
</template>
`);

const defaultAddressTemplateNext3 = XMLParse.INSTANCE.parse(`<template>
  <nodes>
    <node model="resource.ResourceRegion" label="activeRecord.name" labelFields="name" filter="type == 'Province'"/>
    <node model="resource.ResourceRegion" label="activeRecord.name" labelFields="name" references="parent"/>
    <node model="resource.ResourceRegion" label="activeRecord.name" labelFields="name" references="parent"/>
  </nodes>
</template>
`);

export enum DefaultAddressTypeEnum {
  /**
   * 国家-省-市-区
   */
  COUNTRY_PROVINCE_CITY_DISTRICT = 'COUNTRY_PROVINCE_CITY_DISTRICT',
  /**
   * 省-市-区-街道
   */
  PROVINCE_CITY_DISTRICT_STREET = 'PROVINCE_CITY_DISTRICT_STREET',
  /**
   * 省-市-区
   */
  PROVINCE_CITY_DISTRICT = 'PROVINCE_CITY_DISTRICT'
}

export function generatorDefaultAddressTreeDefinition(
  addressType?: DefaultAddressTypeEnum
): TreeNodeMetadata | undefined {
  if (ExperimentalConfigManager.addressWidgetNext()) {
    if (addressType) {
      switch (addressType) {
        case DefaultAddressTypeEnum.COUNTRY_PROVINCE_CITY_DISTRICT:
          return TreeUtils.convert(defaultAddressTemplateNext1);
        case DefaultAddressTypeEnum.PROVINCE_CITY_DISTRICT_STREET:
          return TreeUtils.convert(defaultAddressTemplateNext2);
        case DefaultAddressTypeEnum.PROVINCE_CITY_DISTRICT:
          return TreeUtils.convert(defaultAddressTemplateNext3);
        default:
          return TreeUtils.convert(defaultAddressTemplateNext);
      }
    }
    return TreeUtils.convert(defaultAddressTemplateNext);
  }
  if (addressType) {
    switch (addressType) {
      case DefaultAddressTypeEnum.COUNTRY_PROVINCE_CITY_DISTRICT:
        return TreeUtils.convert(defaultAddressTemplate1);
      case DefaultAddressTypeEnum.PROVINCE_CITY_DISTRICT_STREET:
        return TreeUtils.convert(defaultAddressTemplate2);
      case DefaultAddressTypeEnum.PROVINCE_CITY_DISTRICT:
        return TreeUtils.convert(defaultAddressTemplate3);
      default:
        return TreeUtils.convert(defaultAddressTemplate);
    }
  }
  return TreeUtils.convert(defaultAddressTemplate);
}

const defaultCompanyTemplate = XMLParse.INSTANCE.parse(`<template>
  <nodes>
    <node model="business.PamirsCompany" label="activeRecord.name" labelFields="name" selfReferences="parent" />
  </nodes>
</template>
`);

export function generatorDefaultCompanyTreeDefinition(): TreeNodeMetadata | undefined {
  return TreeUtils.convert(defaultCompanyTemplate);
}

const defaultDepartmentTemplate = XMLParse.INSTANCE.parse(`<template>
  <nodes>
    <node model="business.PamirsCompany" label="activeRecord.name" labelFields="name" selfReferences="parent" />
    <node model="business.PamirsDepartment" label="activeRecord.name" labelFields="name" references="company" selfReferences="parent" />
  </nodes>
</template>
`);

export function generatorDefaultDepartmentTreeDefinition(): TreeNodeMetadata | undefined {
  return TreeUtils.convert(defaultDepartmentTemplate);
}

const defaultEmployeeTemplate = XMLParse.INSTANCE.parse(`<template>
  <nodes>
    <node model="business.PamirsCompany" label="activeRecord.name" labelFields="name" selfReferences="parent" />
    <node model="business.PamirsDepartment" label="activeRecord.name" labelFields="name" references="company" selfReferences="parent" />
    <node model="business.PamirsEmployee" label="activeRecord.name" labelFields="name" references="departmentList" />
  </nodes>
</template>
`);

export function generatorDefaultEmployeeTreeDefinition(): TreeNodeMetadata | undefined {
  return TreeUtils.convert(defaultEmployeeTemplate);
}

const defaultTranslateTemplate = XMLParse.INSTANCE.parse(`<template>
  <nodes>
    <node model="business.PamirsCompany" label="activeRecord.name" labelFields="name" selfReferences="parent" />
  </nodes>
</template>
`);

export function generatorDefaultTranslateTreeDefinition(): TreeNodeMetadata | undefined {
  return TreeUtils.convert(defaultTranslateTemplate);
}
