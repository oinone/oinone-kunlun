import { ModelFieldType, ModelType, SYSTEM_MODULE, SYSTEM_MODULE_NAME } from '@oinone/kunlun-meta';
import { FunctionSelfFlag, type RuntimeModel, type RuntimeRelationField } from '../../../runtime-metadata';
import type { ActiveRecord } from '../../../typing';
import { MetadataHelper } from '../../util/metadata-helper';

export interface QueryPagination {
  currentPage: number;
  size: number;
  sort?: { orders: QuerySort[] };
  groupBy?: string;

  totalPages?: number;
  totalElements?: number;
}

export interface QuerySort {
  field: string;
  direction: string;
}

export interface QueryWrapper {
  model?: string;
  rsql?: string;
  queryData?: ActiveRecord;
}

export interface QueryPageResult<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
}

export interface RelationDataModel {
  data: ActiveRecord;
  relations?: Record<string, RelationData>;
}

export interface RelationData {
  field: RuntimeRelationField;
  create: RelationDataModel[];
  update: RelationDataModel[];
  delete: RelationDataModel[];
}

export interface ConditionWrapper {
  model?: string;
  rsql?: string;
  sort?: { orders: QuerySort[] };
  queryData?: ActiveRecord;
}

const ID = 'id';

export namespace StaticMetadata {
  export const DRAFT_CODE_FIELD = 'draftCode';

  export const QueryOrderModel = '$$query_order_model';

  export const QueryOrderModelName = '$$query_order_model';

  export const QueryOrder: RuntimeModel = {
    model: QueryOrderModel,
    name: QueryOrderModelName,
    module: SYSTEM_MODULE.BASE,
    moduleName: SYSTEM_MODULE_NAME.BASE,
    modelActions: [],
    modelFields: [
      MetadataHelper.buildSimpleModelField(QueryOrderModel, QueryOrderModelName, {
        data: 'field',
        ttype: ModelFieldType.String
      }),
      MetadataHelper.buildSimpleModelField(QueryOrderModel, QueryOrderModelName, {
        data: 'direction',
        ttype: ModelFieldType.Enum
      })
    ]
  };

  export const QuerySortModel = '$$query_sort_model';

  export const QuerySortModelName = '$$query_sort_model';

  export const QuerySort: RuntimeModel = {
    model: QuerySortModel,
    name: QuerySortModelName,
    module: SYSTEM_MODULE.BASE,
    moduleName: SYSTEM_MODULE_NAME.BASE,
    modelActions: [],
    modelFields: [
      MetadataHelper.buildSimpleModelField(QuerySortModel, QuerySortModelName, {
        data: 'orders',
        ttype: ModelFieldType.OneToMany,
        references: QueryOrderModel,
        referencesModel: QueryOrder
      })
    ]
  };

  export const PaginationModel = 'base.Pagination';

  export const PaginationModelName = 'pagination';

  export const QueryPagination: RuntimeModel = {
    model: PaginationModel,
    name: PaginationModelName,
    module: SYSTEM_MODULE.BASE,
    moduleName: SYSTEM_MODULE_NAME.BASE,
    modelActions: [],
    modelFields: [
      MetadataHelper.buildSimpleModelField(PaginationModel, PaginationModelName, {
        data: 'currentPage',
        ttype: ModelFieldType.Integer
      }),
      MetadataHelper.buildSimpleModelField(PaginationModel, PaginationModelName, {
        data: 'size',
        ttype: ModelFieldType.Integer
      }),
      MetadataHelper.buildSimpleModelField(PaginationModel, PaginationModelName, {
        data: 'sort',
        ttype: ModelFieldType.OneToOne,
        references: QuerySortModel,
        referencesModel: QuerySort
      }),
      MetadataHelper.buildSimpleModelField(PaginationModel, PaginationModelName, {
        data: 'groupBy',
        ttype: ModelFieldType.String
      })
    ]
  };

  export const QueryWrapperModel = 'base.Condition';

  export const QueryWrapperModelName = 'condition';

  export const QueryWrapper: RuntimeModel = {
    model: QueryWrapperModel,
    name: QueryWrapperModelName,
    module: SYSTEM_MODULE.BASE,
    moduleName: SYSTEM_MODULE_NAME.BASE,
    modelActions: [],
    modelFields: [
      MetadataHelper.buildSimpleModelField(QueryWrapperModel, QueryWrapperModelName, {
        data: 'rsql',
        ttype: ModelFieldType.String
      }),
      MetadataHelper.buildSimpleModelField(QueryWrapperModel, QueryWrapperModelName, {
        data: 'queryData',
        ttype: ModelFieldType.Map
      })
    ]
  };

  export const QueryPageResultModel = PaginationModel;

  export const QueryPageResultModelName = PaginationModelName;

  export const QueryPageResult: RuntimeModel = {
    model: QueryPageResultModel,
    name: QueryPageResultModelName,
    module: SYSTEM_MODULE.BASE,
    moduleName: SYSTEM_MODULE_NAME.BASE,
    modelActions: [],
    modelFields: [
      MetadataHelper.buildSimpleModelField(QueryPageResultModel, QueryPageResultModelName, {
        data: 'content',
        ttype: FunctionSelfFlag as ModelFieldType
      }),
      MetadataHelper.buildSimpleModelField(QueryPageResultModel, QueryPageResultModelName, {
        data: 'totalPages',
        ttype: ModelFieldType.Integer
      }),
      MetadataHelper.buildSimpleModelField(QueryPageResultModel, QueryPageResultModelName, {
        data: 'totalElements',
        ttype: ModelFieldType.Integer
      })
    ]
  };

  export const ConditionWrapperModel = 'core.common.ConditionWrapper';

  export const ConditionWrapperModelName = 'conditionWrapper';

  export const ConditionWrapper: RuntimeModel = {
    model: ConditionWrapperModel,
    name: ConditionWrapperModelName,
    module: SYSTEM_MODULE.BASE,
    moduleName: SYSTEM_MODULE_NAME.BASE,
    modelActions: [],
    modelFields: [
      MetadataHelper.buildSimpleModelField(ConditionWrapperModel, ConditionWrapperModelName, {
        data: 'model',
        ttype: ModelFieldType.String
      }),
      MetadataHelper.buildSimpleModelField(ConditionWrapperModel, ConditionWrapperModelName, {
        data: 'rsql',
        ttype: ModelFieldType.String
      }),
      MetadataHelper.buildSimpleModelField(ConditionWrapperModel, ConditionWrapperModelName, {
        data: 'sort',
        ttype: ModelFieldType.OneToOne,
        references: QuerySortModel,
        referencesModel: QuerySort
      }),
      MetadataHelper.buildSimpleModelField(ConditionWrapperModel, ConditionWrapperModelName, {
        data: 'queryData',
        ttype: ModelFieldType.Map
      })
    ]
  };

  export const IdModelModel = '$$id_model_model';

  export const IdModelName = '$$id_model_name';

  export const IdModel: RuntimeModel = {
    model: IdModelModel,
    name: IdModelName,
    module: SYSTEM_MODULE.BASE,
    moduleName: SYSTEM_MODULE_NAME.BASE,
    pks: [ID],
    modelActions: [],
    modelFields: [
      MetadataHelper.buildSimpleModelField(IdModelModel, IdModelName, {
        data: ID,
        ttype: ModelFieldType.Integer
      })
    ]
  };

  export const ResourceCountryModel = 'resource.ResourceCountry';

  export const ResourceCountryModelName = 'resourceCountry';

  export const ResourceCountry: RuntimeModel = {
    type: ModelType.STORE,
    model: ResourceCountryModel,
    name: ResourceCountryModelName,
    module: SYSTEM_MODULE.RESOURCE,
    moduleName: SYSTEM_MODULE_NAME.RESOURCE,
    pks: [ID],
    modelActions: [],
    modelFields: [
      MetadataHelper.buildSimpleModelField(ResourceCountryModel, ResourceCountryModelName, {
        data: ID,
        ttype: ModelFieldType.Integer
      }),
      MetadataHelper.buildSimpleModelField(ResourceCountryModel, ResourceCountryModelName, {
        data: 'code',
        ttype: ModelFieldType.String
      }),
      MetadataHelper.buildSimpleModelField(ResourceCountryModel, ResourceCountryModelName, {
        data: 'name',
        ttype: ModelFieldType.String
      })
    ]
  };

  export const ResourceProvinceModel = 'resource.ResourceProvince';

  export const ResourceProvinceModelName = 'resourceProvince';

  export const ResourceProvince: RuntimeModel = {
    type: ModelType.STORE,
    model: ResourceProvinceModel,
    name: ResourceProvinceModelName,
    module: SYSTEM_MODULE.RESOURCE,
    moduleName: SYSTEM_MODULE_NAME.RESOURCE,
    pks: [ID],
    modelActions: [],
    modelFields: [
      MetadataHelper.buildSimpleModelField(ResourceProvinceModel, ResourceProvinceModelName, {
        data: ID,
        ttype: ModelFieldType.Integer
      }),
      MetadataHelper.buildSimpleModelField(ResourceProvinceModel, ResourceProvinceModelName, {
        data: 'code',
        ttype: ModelFieldType.String
      }),
      MetadataHelper.buildSimpleModelField(ResourceProvinceModel, ResourceProvinceModelName, {
        data: 'name',
        ttype: ModelFieldType.String
      })
    ]
  };

  export const ResourceCityModel = 'resource.ResourceCity';

  export const ResourceCityModelName = 'resourceCity';

  export const ResourceCity: RuntimeModel = {
    type: ModelType.STORE,
    model: ResourceCityModel,
    name: ResourceCityModelName,
    module: SYSTEM_MODULE.RESOURCE,
    moduleName: SYSTEM_MODULE_NAME.RESOURCE,
    pks: [ID],
    modelActions: [],
    modelFields: [
      MetadataHelper.buildSimpleModelField(ResourceCityModel, ResourceCityModelName, {
        data: ID,
        ttype: ModelFieldType.Integer
      }),
      MetadataHelper.buildSimpleModelField(ResourceCityModel, ResourceCityModelName, {
        data: 'code',
        ttype: ModelFieldType.String
      }),
      MetadataHelper.buildSimpleModelField(ResourceCityModel, ResourceCityModelName, {
        data: 'name',
        ttype: ModelFieldType.String
      })
    ]
  };

  export const ResourceDistrictModel = 'resource.ResourceDistrict';

  export const ResourceDistrictModelName = 'resourceDistrict';

  export const ResourceDistrict: RuntimeModel = {
    type: ModelType.STORE,
    model: ResourceDistrictModel,
    name: ResourceDistrictModelName,
    module: SYSTEM_MODULE.RESOURCE,
    moduleName: SYSTEM_MODULE_NAME.RESOURCE,
    pks: [ID],
    modelActions: [],
    modelFields: [
      MetadataHelper.buildSimpleModelField(ResourceDistrictModel, ResourceDistrictModelName, {
        data: ID,
        ttype: ModelFieldType.Integer
      }),
      MetadataHelper.buildSimpleModelField(ResourceDistrictModel, ResourceDistrictModelName, {
        data: 'code',
        ttype: ModelFieldType.String
      }),
      MetadataHelper.buildSimpleModelField(ResourceDistrictModel, ResourceDistrictModelName, {
        data: 'name',
        ttype: ModelFieldType.String
      })
    ]
  };

  export const ResourceStreetModel = 'resource.ResourceStreet';

  export const ResourceStreetModelName = 'resourceStreet';

  export const ResourceStreet: RuntimeModel = {
    type: ModelType.STORE,
    model: ResourceStreetModel,
    name: ResourceStreetModelName,
    module: SYSTEM_MODULE.RESOURCE,
    moduleName: SYSTEM_MODULE_NAME.RESOURCE,
    pks: [ID],
    modelActions: [],
    modelFields: [
      MetadataHelper.buildSimpleModelField(ResourceStreetModel, ResourceStreetModelName, {
        data: ID,
        ttype: ModelFieldType.Integer
      }),
      MetadataHelper.buildSimpleModelField(ResourceStreetModel, ResourceStreetModelName, {
        data: 'code',
        ttype: ModelFieldType.String
      }),
      MetadataHelper.buildSimpleModelField(ResourceStreetModel, ResourceStreetModelName, {
        data: 'name',
        ttype: ModelFieldType.String
      })
    ]
  };

  export const ResourceAddressModel = 'resource.ResourceAddress';

  export const ResourceAddressModelName = 'resourceAddress';

  export const ResourceAddress: RuntimeModel = {
    type: ModelType.STORE,
    model: ResourceAddressModel,
    name: ResourceAddressModelName,
    module: SYSTEM_MODULE.RESOURCE,
    moduleName: SYSTEM_MODULE_NAME.RESOURCE,
    pks: [ID],
    modelActions: [],
    modelFields: [
      MetadataHelper.buildSimpleModelField(ResourceAddressModel, ResourceAddressModelName, {
        data: ID,
        ttype: ModelFieldType.Integer
      }),
      MetadataHelper.buildSimpleModelField(ResourceAddressModel, ResourceAddressModelName, {
        data: 'street2',
        ttype: ModelFieldType.String
      }),
      MetadataHelper.buildSimpleModelField(ResourceAddressModel, ResourceAddressModelName, {
        data: 'fullAddress',
        ttype: ModelFieldType.String
      }),
      MetadataHelper.buildSimpleModelField(ResourceAddressModel, ResourceAddressModelName, {
        data: 'countryCode',
        ttype: ModelFieldType.String
      }),
      MetadataHelper.buildSimpleModelField(ResourceAddressModel, ResourceAddressModelName, {
        data: 'countryName',
        ttype: ModelFieldType.String,
        displayName: '国家'
      }),
      MetadataHelper.buildSimpleModelField(ResourceAddressModel, ResourceAddressModelName, {
        data: 'originCountry',
        ttype: ModelFieldType.ManyToOne,
        references: ResourceCountryModel,
        referencesModel: ResourceCountry,
        displayName: '国家',
        relationStore: true,
        store: false,
        relationFields: ['countryCode'],
        referenceFields: ['code']
      }),
      MetadataHelper.buildSimpleModelField(ResourceAddressModel, ResourceAddressModelName, {
        data: 'provinceCode',
        ttype: ModelFieldType.String
      }),
      MetadataHelper.buildSimpleModelField(ResourceAddressModel, ResourceAddressModelName, {
        data: 'provinceName',
        ttype: ModelFieldType.String,
        displayName: '省/州'
      }),
      MetadataHelper.buildSimpleModelField(ResourceAddressModel, ResourceAddressModelName, {
        data: 'originProvince',
        ttype: ModelFieldType.ManyToOne,
        references: ResourceProvinceModel,
        referencesModel: ResourceProvince,
        displayName: '省/州',
        relationStore: true,
        store: false,
        relationFields: ['provinceCode'],
        referenceFields: ['code']
      }),
      MetadataHelper.buildSimpleModelField(ResourceAddressModel, ResourceAddressModelName, {
        data: 'cityCode',
        ttype: ModelFieldType.String
      }),
      MetadataHelper.buildSimpleModelField(ResourceAddressModel, ResourceAddressModelName, {
        data: 'cityName',
        ttype: ModelFieldType.String,
        displayName: '市'
      }),
      MetadataHelper.buildSimpleModelField(ResourceAddressModel, ResourceAddressModelName, {
        data: 'originCity',
        ttype: ModelFieldType.ManyToOne,
        references: ResourceCityModel,
        referencesModel: ResourceCity,
        displayName: '市',
        relationStore: true,
        store: false,
        relationFields: ['cityCode'],
        referenceFields: ['code']
      }),
      MetadataHelper.buildSimpleModelField(ResourceAddressModel, ResourceAddressModelName, {
        data: 'districtCode',
        ttype: ModelFieldType.String
      }),
      MetadataHelper.buildSimpleModelField(ResourceAddressModel, ResourceAddressModelName, {
        data: 'districtName',
        ttype: ModelFieldType.String,
        displayName: '区/县'
      }),
      MetadataHelper.buildSimpleModelField(ResourceAddressModel, ResourceAddressModelName, {
        data: 'originDistrict',
        ttype: ModelFieldType.ManyToOne,
        references: ResourceDistrictModel,
        referencesModel: ResourceDistrict,
        displayName: '区/县',
        relationStore: true,
        store: false,
        relationFields: ['districtCode'],
        referenceFields: ['code']
      }),
      MetadataHelper.buildSimpleModelField(ResourceAddressModel, ResourceAddressModelName, {
        data: 'streetCode',
        ttype: ModelFieldType.String
      }),
      MetadataHelper.buildSimpleModelField(ResourceAddressModel, ResourceAddressModelName, {
        data: 'streetName',
        ttype: ModelFieldType.String,
        displayName: '街道'
      }),
      MetadataHelper.buildSimpleModelField(ResourceAddressModel, ResourceAddressModelName, {
        data: 'originStreet',
        ttype: ModelFieldType.ManyToOne,
        references: ResourceStreetModel,
        referencesModel: ResourceStreet,
        displayName: '街道',
        relationStore: true,
        store: false,
        relationFields: ['streetCode'],
        referenceFields: ['code']
      })
    ]
  };

  export const ConfirmModalModel = 'base.ConfirmModal';

  export const ConfirmModalModelName = 'confirmModal';

  export const ConfirmModal: RuntimeModel = {
    model: ConfirmModalModel,
    name: ConfirmModalModelName,
    module: SYSTEM_MODULE.BASE,
    moduleName: SYSTEM_MODULE_NAME.BASE,
    modelActions: [],
    modelFields: [
      MetadataHelper.buildSimpleModelField(ConfirmModalModel, ConfirmModalModelName, {
        data: 'title',
        ttype: ModelFieldType.String
      }),
      MetadataHelper.buildSimpleModelField(ConfirmModalModel, ConfirmModalModelName, {
        data: 'content',
        ttype: ModelFieldType.String
      }),
      MetadataHelper.buildSimpleModelField(ConfirmModalModel, ConfirmModalModelName, {
        data: 'context',
        ttype: ModelFieldType.Map
      })
    ]
  };
}
