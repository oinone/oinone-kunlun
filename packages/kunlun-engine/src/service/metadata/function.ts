import { ModelFieldType } from '@oinone/kunlun-meta';
import { FunctionSelfFlag, FunctionType, RuntimeFunctionDefinition } from '../../runtime-metadata';
import { StaticMetadata } from './model';

export namespace FunctionMetadata {
  export const QUERY_ONE_NAME = 'queryOne';

  export const queryOne: RuntimeFunctionDefinition = {
    type: [FunctionType.QUERY],
    namespace: FunctionSelfFlag,
    name: QUERY_ONE_NAME,
    fun: QUERY_ONE_NAME,
    argumentList: [
      {
        name: 'query',
        ttype: FunctionSelfFlag
      }
    ],
    returnType: {
      ttype: FunctionSelfFlag
    }
  };

  export const QUERY_ONE_BY_WRAPPER_NAME = 'queryOneByWrapper';

  export const queryOneByWrapper: RuntimeFunctionDefinition = {
    type: [FunctionType.QUERY],
    namespace: FunctionSelfFlag,
    name: QUERY_ONE_BY_WRAPPER_NAME,
    fun: QUERY_ONE_BY_WRAPPER_NAME,
    argumentList: [
      {
        name: 'queryWrapper',
        ttype: ModelFieldType.ManyToOne,
        model: StaticMetadata.QueryWrapperModel,
        modelDefinition: StaticMetadata.QueryWrapper
      }
    ],
    returnType: {
      ttype: FunctionSelfFlag
    }
  };

  export const QUERY_PAGE_NAME = 'queryPage';

  export const queryPage: RuntimeFunctionDefinition = {
    type: [FunctionType.QUERY],
    namespace: FunctionSelfFlag,
    name: QUERY_PAGE_NAME,
    fun: QUERY_PAGE_NAME,
    argumentList: [
      {
        name: 'page',
        ttype: ModelFieldType.ManyToOne,
        model: StaticMetadata.PaginationModel,
        modelDefinition: StaticMetadata.QueryPagination
      },
      {
        name: 'queryWrapper',
        ttype: ModelFieldType.ManyToOne,
        model: StaticMetadata.QueryWrapperModel,
        modelDefinition: StaticMetadata.QueryWrapper
      }
    ],
    returnType: {
      ttype: ModelFieldType.ManyToOne,
      model: StaticMetadata.QueryPageResultModel,
      modelDefinition: StaticMetadata.QueryPageResult
    }
  };

  export const RELATION_QUERY_PAGE_NAME = 'relationQueryPage';

  export const relationQueryPage: RuntimeFunctionDefinition = {
    type: [FunctionType.QUERY],
    namespace: FunctionSelfFlag,
    name: RELATION_QUERY_PAGE_NAME,
    fun: RELATION_QUERY_PAGE_NAME,
    argumentList: [
      {
        name: 'page',
        ttype: ModelFieldType.ManyToOne,
        model: StaticMetadata.PaginationModel,
        modelDefinition: StaticMetadata.QueryPagination
      },
      {
        name: 'queryWrapper',
        ttype: ModelFieldType.ManyToOne,
        model: StaticMetadata.QueryWrapperModel,
        modelDefinition: StaticMetadata.QueryWrapper
      },
      {
        name: 'relationModel',
        ttype: ModelFieldType.String
      },
      {
        name: 'relationField',
        ttype: ModelFieldType.String
      },
      {
        name: 'relationData',
        ttype: FunctionSelfFlag
      }
    ],
    returnType: {
      ttype: ModelFieldType.ManyToOne,
      model: StaticMetadata.QueryPageResultModel,
      modelDefinition: StaticMetadata.QueryPageResult
    }
  };

  export const CREATE_NAME = 'create';

  export const createFunction: RuntimeFunctionDefinition = {
    type: [FunctionType.CREATE],
    namespace: FunctionSelfFlag,
    name: CREATE_NAME,
    fun: CREATE_NAME,
    argumentList: [
      {
        name: 'data',
        ttype: FunctionSelfFlag
      }
    ],
    returnType: {
      ttype: FunctionSelfFlag
    }
  };

  export const UPDATE_NAME = 'update';

  export const updateFunction: RuntimeFunctionDefinition = {
    type: [FunctionType.UPDATE],
    namespace: FunctionSelfFlag,
    name: UPDATE_NAME,
    fun: UPDATE_NAME,
    argumentList: [
      {
        name: 'data',
        ttype: FunctionSelfFlag
      }
    ],
    returnType: {
      ttype: FunctionSelfFlag
    }
  };

  export const UPDATE_ONE_WITH_RELATIONS_NAME = 'updateOneWithRelations';

  export const updateOneWithRelationsFunction: RuntimeFunctionDefinition = {
    type: [FunctionType.UPDATE],
    namespace: FunctionSelfFlag,
    name: UPDATE_ONE_WITH_RELATIONS_NAME,
    fun: UPDATE_ONE_WITH_RELATIONS_NAME,
    argumentList: [],
    returnType: {
      ttype: FunctionSelfFlag
    }
  };

  export const UPDATE_WITH_FIELD_BATCH_NAME = 'updateWithFieldBatch';

  export const updateWithFieldBatch: RuntimeFunctionDefinition = {
    type: [FunctionType.UPDATE],
    namespace: FunctionSelfFlag,
    name: UPDATE_WITH_FIELD_BATCH_NAME,
    fun: UPDATE_WITH_FIELD_BATCH_NAME,
    argumentList: [
      {
        name: 'dataList',
        ttype: FunctionSelfFlag
      }
    ],
    returnType: {
      ttype: FunctionSelfFlag
    }
  };
}
