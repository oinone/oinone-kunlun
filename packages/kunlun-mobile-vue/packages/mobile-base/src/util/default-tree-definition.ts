import { XMLParse } from '@oinone/kunlun-dsl';
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

export function generatorDefaultAddressTreeDefinition(): TreeNodeMetadata | undefined {
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
