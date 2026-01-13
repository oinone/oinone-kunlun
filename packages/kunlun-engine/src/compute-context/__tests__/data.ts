import type { RuntimeModel, RuntimeView } from '../../runtime-metadata';
import { MetadataHelper } from '../../service';
import type { ExpressionRunParam } from '@oinone/kunlun-expression';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';

export const data = {
  name: 'aaa',
  field0003: 100,
  field0004: false,
  field0005: 7,
  field0006: 5,
  'contactAddress#originCountry': {
    code: 1
  }
};

export const parameters: ExpressionRunParam = {
  activeRecords: [data],
  rootRecord: data,
  openerRecord: {},
  scene: 'uiView0000000000059001',
  activeRecord: data
};

const model1_Model = 'model1';
const model1_ModelName = 'model1';

const model2_Model = 'model2';
const model2_ModelName = 'model2';

const model3_Model = 'model3';
const model3_ModelName = 'model3';

export const model3: RuntimeModel = {
  model: model3_Model,
  name: model3_ModelName,
  module: 'demo',
  moduleName: 'demo',
  modelActions: [],
  modelFields: [
    MetadataHelper.buildSimpleModelField(model3_Model, model3_ModelName, {
      data: 'code',
      ttype: ModelFieldType.String,
      displayName: '编码3'
    }),
    MetadataHelper.buildSimpleModelField(model3_Model, model3_ModelName, {
      data: 'name',
      ttype: ModelFieldType.String,
      displayName: '名称3'
    })
  ]
};

export const model2: RuntimeModel = {
  model: model2_Model,
  name: model2_ModelName,
  module: 'demo',
  moduleName: 'demo',
  modelActions: [],
  modelFields: [
    MetadataHelper.buildSimpleModelField(model2_Model, model2_ModelName, {
      data: 'code',
      ttype: ModelFieldType.String,
      displayName: '编码2'
    }),
    MetadataHelper.buildSimpleModelField(model2_Model, model2_ModelName, {
      data: 'name',
      ttype: ModelFieldType.String,
      displayName: '名称2'
    }),
    MetadataHelper.buildSimpleModelField(model1_Model, model1_ModelName, {
      data: 'model3',
      ttype: ModelFieldType.ManyToOne,
      displayName: '模型3',
      references: model3_Model,
      referencesModel: model3
    })
  ]
};

export const model1: RuntimeModel = {
  model: model1_Model,
  name: model1_ModelName,
  module: 'demo',
  moduleName: 'demo',
  modelActions: [],
  modelFields: [
    MetadataHelper.buildSimpleModelField(model1_Model, model1_ModelName, {
      data: 'code',
      ttype: ModelFieldType.String,
      displayName: '编码'
    }),
    MetadataHelper.buildSimpleModelField(model1_Model, model1_ModelName, {
      data: 'name',
      ttype: ModelFieldType.String,
      displayName: '名称'
    }),
    MetadataHelper.buildSimpleModelField(model1_Model, model1_ModelName, {
      data: 'model2',
      ttype: ModelFieldType.ManyToOne,
      displayName: '模型2',
      references: model2_Model,
      referencesModel: model2
    }),
    MetadataHelper.buildSimpleModelField(model1_Model, model1_ModelName, {
      data: 'model3',
      ttype: ModelFieldType.ManyToOne,
      displayName: '模型3',
      references: model3_Model,
      referencesModel: model3
    })
  ]
};

export const viewTemplate = `<view type="form">
<!--    <field data="id" defaultValue="336327172278978317" />-->
<!--    <field data="code" defaultValue="abc" />-->
<!--    <field data="name" defaultValue="activeRecord.code" />-->
    <field data="price" compute="activeRecord.sum / activeRecord.count" />
    <field data="count" compute="activeRecord.sum / activeRecord.price"/>
    <field data="sum" compute="activeRecord.price * activeRecord.count" />
<!--    <field data="isEnabled" defaultValue="false" />-->
</view>`;

export const view: RuntimeView = {
  type: ViewType.Form,
  model: model1_Model,
  modelName: model1_ModelName,
  modelDefinition: model1,
  template: viewTemplate
};

export interface ViewData extends Record<string, unknown> {
  id: string;
  code: string;
  name: string;
  price: number;
  count: number;
  sum: number;
  isEnabled: boolean;
}
