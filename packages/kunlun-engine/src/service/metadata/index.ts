import {
  ConditionWrapper,
  FunctionMetadata as BasicFunctionMetadata,
  QueryPageResult,
  QueryPagination,
  QuerySort,
  QueryWrapper,
  RelationData,
  RelationDataModel,
  StaticMetadata as BasicStaticMetadata
} from './basic';
import {
  FunctionMetadata as TableGroupingFunctionMetadata,
  GroupingData,
  GroupingField,
  GroupingStatisticField,
  GroupStatisticsEnum,
  QueryGroupResult,
  QueryGroupsValue,
  StaticMetadata as TableGroupingStaticMetadata
} from './table-grouping';

export const StaticMetadata = {
  ...BasicStaticMetadata,
  ...TableGroupingStaticMetadata
};

export const FunctionMetadata = {
  ...BasicFunctionMetadata,
  ...TableGroupingFunctionMetadata
};

export {
  ConditionWrapper,
  QueryPageResult,
  QueryPagination,
  QuerySort,
  QueryWrapper,
  RelationData,
  RelationDataModel,
  GroupingData,
  GroupingField,
  GroupingStatisticField,
  GroupStatisticsEnum,
  QueryGroupResult,
  QueryGroupsValue
};
