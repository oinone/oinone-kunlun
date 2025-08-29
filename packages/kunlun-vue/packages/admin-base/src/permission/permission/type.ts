import { IModel, IModelField, ModelFieldType } from '@oinone/kunlun-meta';

export interface IPermission extends Record<string, unknown> {
  id?: string;
  name: string;
  permissionType: 'ACTION' | 'ROW' | 'COL';
  model: string;
  permRun?: boolean;
  permRead?: boolean;
  permWrite?: boolean;
  permDelete?: boolean;
  permissionDataSource: string;
  action?: string;
  field?: string;
  permissionMateDataType?: string;
  active: boolean;
  domainExp?: string;
  domainExpJson?: string;
  domainExpDisplayName?: string;
  modelDisplayName?: string;
  resourceId?: string;
  uniqueId?: string;
}

export const ResourcePermissionModel = {
  model: 'auth.ResourcePermission',
  name: 'resourcePermission',
  module: 'auth',
  moduleName: 'auth'
};

export const ResourcePermissionFieldGroupsModel = {
  model: 'base.Model',
  name: 'model',
  module: 'base',
  moduleName: 'base',
  modelFields: [
    { name: 'module', ttype: ModelFieldType.String },
    { name: 'moduleName', ttype: ModelFieldType.String },
    { name: 'name', ttype: ModelFieldType.String },
    { name: 'displayName', ttype: ModelFieldType.String },
    { name: 'model', ttype: ModelFieldType.String },
    { name: 'description', ttype: ModelFieldType.String }
  ] as IModelField[]
} as IModel;

export const ResourcePermissionUserModel = {
  model: 'user.PamirsUser',
  name: 'user',
  module: 'user',
  moduleName: 'user',
  modelFields: [
    { name: 'id', ttype: ModelFieldType.Long },
    { name: 'name', ttype: ModelFieldType.String },
    { name: 'login', ttype: ModelFieldType.String },
    { name: 'active', ttype: ModelFieldType.Boolean }
  ] as IModelField[]
} as IModel;
