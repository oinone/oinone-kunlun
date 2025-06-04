import { ModelFieldType, SYSTEM_MODULE, SYSTEM_MODULE_NAME } from '@oinone/kunlun-meta';
import { FunctionSelfFlag, RuntimeModel, RuntimeRelationField } from '../../runtime-metadata';
import { ActiveRecord } from '../../typing';
import { MetadataHelper } from '../util';

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

export namespace StaticMetadata {
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
        referencesModel: StaticMetadata.QueryOrder
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
        referencesModel: StaticMetadata.QuerySort
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

  export const IdModelModel = '$$id_model_model';

  export const IdModelName = '$$id_model_name';

  export const IdModel: RuntimeModel = {
    model: IdModelModel,
    name: IdModelName,
    module: SYSTEM_MODULE.BASE,
    moduleName: SYSTEM_MODULE_NAME.BASE,
    modelActions: [],
    modelFields: [
      MetadataHelper.buildSimpleModelField(IdModelModel, IdModelName, {
        data: 'id',
        ttype: ModelFieldType.Integer
      })
    ]
  };

  export const ResourceCountryModel = 'resource.ResourceCountry';

  export const ResourceCountryModelName = 'resourceCountry';

  export const ResourceCountry: RuntimeModel = {
    model: ResourceCountryModel,
    name: ResourceCountryModelName,
    module: SYSTEM_MODULE.RESOURCE,
    moduleName: SYSTEM_MODULE_NAME.RESOURCE,
    modelActions: [],
    modelFields: [
      MetadataHelper.buildSimpleModelField(ResourceCountryModel, ResourceCountryModelName, {
        data: 'id',
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
    model: ResourceProvinceModel,
    name: ResourceProvinceModelName,
    module: SYSTEM_MODULE.RESOURCE,
    moduleName: SYSTEM_MODULE_NAME.RESOURCE,
    modelActions: [],
    modelFields: [
      MetadataHelper.buildSimpleModelField(ResourceProvinceModel, ResourceProvinceModelName, {
        data: 'id',
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
    model: ResourceCityModel,
    name: ResourceCityModelName,
    module: SYSTEM_MODULE.RESOURCE,
    moduleName: SYSTEM_MODULE_NAME.RESOURCE,
    modelActions: [],
    modelFields: [
      MetadataHelper.buildSimpleModelField(ResourceCityModel, ResourceCityModelName, {
        data: 'id',
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
    model: ResourceDistrictModel,
    name: ResourceDistrictModelName,
    module: SYSTEM_MODULE.RESOURCE,
    moduleName: SYSTEM_MODULE_NAME.RESOURCE,
    modelActions: [],
    modelFields: [
      MetadataHelper.buildSimpleModelField(ResourceDistrictModel, ResourceDistrictModelName, {
        data: 'id',
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
    model: ResourceStreetModel,
    name: ResourceStreetModelName,
    module: SYSTEM_MODULE.RESOURCE,
    moduleName: SYSTEM_MODULE_NAME.RESOURCE,
    modelActions: [],
    modelFields: [
      MetadataHelper.buildSimpleModelField(ResourceStreetModel, ResourceStreetModelName, {
        data: 'id',
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
    model: ResourceAddressModel,
    name: ResourceAddressModelName,
    module: SYSTEM_MODULE.RESOURCE,
    moduleName: SYSTEM_MODULE_NAME.RESOURCE,
    modelActions: [],
    modelFields: [
      MetadataHelper.buildSimpleModelField(ResourceAddressModel, ResourceAddressModelName, {
        data: 'id',
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
        ttype: ModelFieldType.String
      }),
      MetadataHelper.buildSimpleModelField(ResourceAddressModel, ResourceAddressModelName, {
        data: 'originCountry',
        ttype: ModelFieldType.ManyToOne,
        references: ResourceCountryModel,
        referencesModel: ResourceCountry
      }),
      MetadataHelper.buildSimpleModelField(ResourceAddressModel, ResourceAddressModelName, {
        data: 'provinceCode',
        ttype: ModelFieldType.String
      }),
      MetadataHelper.buildSimpleModelField(ResourceAddressModel, ResourceAddressModelName, {
        data: 'provinceName',
        ttype: ModelFieldType.String
      }),
      MetadataHelper.buildSimpleModelField(ResourceAddressModel, ResourceAddressModelName, {
        data: 'originProvince',
        ttype: ModelFieldType.ManyToOne,
        references: ResourceProvinceModel,
        referencesModel: ResourceProvince
      }),
      MetadataHelper.buildSimpleModelField(ResourceAddressModel, ResourceAddressModelName, {
        data: 'cityCode',
        ttype: ModelFieldType.String
      }),
      MetadataHelper.buildSimpleModelField(ResourceAddressModel, ResourceAddressModelName, {
        data: 'cityName',
        ttype: ModelFieldType.String
      }),
      MetadataHelper.buildSimpleModelField(ResourceAddressModel, ResourceAddressModelName, {
        data: 'originCity',
        ttype: ModelFieldType.ManyToOne,
        references: ResourceCityModel,
        referencesModel: ResourceCity
      }),
      MetadataHelper.buildSimpleModelField(ResourceAddressModel, ResourceAddressModelName, {
        data: 'districtName',
        ttype: ModelFieldType.String
      }),
      MetadataHelper.buildSimpleModelField(ResourceAddressModel, ResourceAddressModelName, {
        data: 'districtCode',
        ttype: ModelFieldType.String
      }),
      MetadataHelper.buildSimpleModelField(ResourceAddressModel, ResourceAddressModelName, {
        data: 'originDistrict',
        ttype: ModelFieldType.ManyToOne,
        references: ResourceDistrictModel,
        referencesModel: ResourceDistrict
      }),
      MetadataHelper.buildSimpleModelField(ResourceAddressModel, ResourceAddressModelName, {
        data: 'streetCode',
        ttype: ModelFieldType.String
      }),
      MetadataHelper.buildSimpleModelField(ResourceAddressModel, ResourceAddressModelName, {
        data: 'streetName',
        ttype: ModelFieldType.String
      }),
      MetadataHelper.buildSimpleModelField(ResourceAddressModel, ResourceAddressModelName, {
        data: 'originStreet',
        ttype: ModelFieldType.ManyToOne,
        references: ResourceStreetModel,
        referencesModel: ResourceStreet
      })
    ]
  };
}
