import {
  EntityId,
  IModel,
  IModelField,
  IModule,
  ModelFieldType,
  ModelFieldTypeDisplayName,
  SystemSource
} from '@kunlun/meta';

export enum ElementSize {
  LARGE = 'large',
  MIDDLE = 'middle',
  SMALL = 'small'
}

export interface IExpSelectOption {
  label: string;
  value: string | number;
  active?: boolean;
  selected?: boolean;
  optType?: 'group' | 'option';
  ttype?: ModelFieldType;
  // 子节点数据是否加载
  isChildrenLoaded?: boolean;
  children?: IExpSelectOption[];

  [key: string]: any;
}

export interface IExpComposeReferenceModel {
  model: string;
  displayName: string;
  fieldType: string;
  referenceFields?: string[];
  relationFields?: string[];
  hasMore: boolean;
  field: IModelField;
  referenceModel: IExpComposeReferenceModel;
  relLinkedModelFields: IModelField[];
  throughModel: IModel;
  throughRelLinkedFields: IModelField[];
  throughRefLinkedFields: IModelField[];
  refLinkedModelFields: IModelField[];
  designerRelationWays: string;
}

export interface IExpModel extends IModel {
  // 模块编码
  module?: string;
  systemSource: SystemSource;
  categoryId?: string;
  referenceModels: IExpComposeReferenceModel[];
  __draftId?: EntityId;

  [key: string]: any;
}

export enum ExpActiveType {
  ALL = 'ALL',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export enum ExpModelConfig {
  BaseModel = 'base.Model',
  BaseField = 'base.Field',
  DesignerModelField = 'designer.DesignerModelField',
  DesignerModelDefinition = 'designer.DesignerModelDefinition',
  DesignerExpressionDefinition = 'designer.DesignerExpressionDefinition'
}

export const EXP_MODULE = {
  name: 'expression',
  module: 'expression'
} as IModule;

export type IFunFilterMethod = (field: IModelField) => boolean;

export interface IExpTtypeInfo {
  ttype: ModelFieldType;
  displayName: string;
  icon: string;
}
export const ExpTtypeInfoList: IExpTtypeInfo[] = [
  {
    ttype: ModelFieldType.UID,
    displayName: ModelFieldTypeDisplayName.UID,
    icon: 'oinone-ttype-userid'
  },
  {
    ttype: ModelFieldType.ID,
    displayName: ModelFieldTypeDisplayName.ID,
    icon: 'oinone-integer'
  },
  {
    ttype: ModelFieldType.Integer,
    displayName: ModelFieldTypeDisplayName.INTEGER,
    icon: 'oinone-integer'
  },
  {
    ttype: ModelFieldType.Long,
    displayName: ModelFieldTypeDisplayName.LONG,
    icon: 'oinone-integer'
  },
  {
    ttype: ModelFieldType.Float,
    displayName: ModelFieldTypeDisplayName.FLOAT,
    icon: 'oinone-float'
  },
  {
    ttype: ModelFieldType.Currency,
    displayName: ModelFieldTypeDisplayName.MONEY,
    icon: 'oinone-currency'
  },
  {
    ttype: ModelFieldType.Boolean,
    displayName: ModelFieldTypeDisplayName.BOOLEAN,
    icon: 'oinone-boolean'
  },
  {
    ttype: ModelFieldType.String,
    displayName: ModelFieldTypeDisplayName.STRING,
    icon: 'oinone-string'
  },
  {
    ttype: ModelFieldType.Text,
    displayName: ModelFieldTypeDisplayName.TEXT,
    icon: 'oinone-text'
  },
  {
    ttype: ModelFieldType.HTML,
    displayName: ModelFieldTypeDisplayName.HTML,
    icon: 'oinone-richtext'
  },
  {
    ttype: ModelFieldType.DateTime,
    displayName: ModelFieldTypeDisplayName.DATETIME,
    icon: 'oinone-datetime'
  },
  {
    ttype: ModelFieldType.Year,
    displayName: ModelFieldTypeDisplayName.YEAR,
    icon: 'oinone-year'
  },
  {
    ttype: ModelFieldType.Date,
    displayName: ModelFieldTypeDisplayName.DATE,
    icon: 'oinone-date'
  },
  {
    ttype: ModelFieldType.Time,
    displayName: ModelFieldTypeDisplayName.TIME,
    icon: 'oinone-time'
  },
  {
    ttype: ModelFieldType.Enum,
    displayName: ModelFieldTypeDisplayName.ENUM,
    icon: 'oinone-dictionary'
  },
  {
    ttype: ModelFieldType.Map,
    displayName: ModelFieldTypeDisplayName.MAP,
    icon: 'oinone-map'
  },
  {
    ttype: ModelFieldType.Phone,
    displayName: ModelFieldTypeDisplayName.PHONE,
    icon: 'oinone-phone'
  },
  {
    ttype: ModelFieldType.Email,
    displayName: ModelFieldTypeDisplayName.EMAIL,
    icon: 'oinone-email'
  },
  {
    ttype: ModelFieldType.OneToOne,
    displayName: ModelFieldTypeDisplayName.O2O,
    icon: 'oinone-yiduiyi'
  },
  {
    ttype: ModelFieldType.ManyToOne,
    displayName: ModelFieldTypeDisplayName.M2O,
    icon: 'oinone-duoduiyi'
  },
  {
    ttype: ModelFieldType.OneToMany,
    displayName: ModelFieldTypeDisplayName.O2M,
    icon: 'oinone-yiduiduo'
  },
  {
    ttype: ModelFieldType.ManyToMany,
    displayName: ModelFieldTypeDisplayName.M2M,
    icon: 'oinone-duoduiduo'
  }
] as IExpTtypeInfo[];

export const ExpTtypeInfoMap = new Map<ModelFieldType, IExpTtypeInfo>();
ExpTtypeInfoList.forEach((a) => {
  ExpTtypeInfoMap.set(a.ttype, a);
});

export const EXPRESSION_TTYPES = [
  ModelFieldType.ID,
  ModelFieldType.Integer,
  ModelFieldType.Long,
  ModelFieldType.Float,
  ModelFieldType.Boolean,
  ModelFieldType.String,
  ModelFieldType.Text,
  ModelFieldType.DateTime,
  ModelFieldType.Date,
  ModelFieldType.Time,
  ModelFieldType.Year,
  ModelFieldType.HTML,
  ModelFieldType.Currency,
  ModelFieldType.Enum,
  ModelFieldType.MultiEnum,
  ModelFieldType.UID,
  ModelFieldType.Phone,
  ModelFieldType.Email,
  ModelFieldType.ManyToMany,
  ModelFieldType.ManyToOne,
  ModelFieldType.OneToOne,
  ModelFieldType.OneToMany
] as ModelFieldType[];
