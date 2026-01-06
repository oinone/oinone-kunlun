import { type ConditionWrapper, FunctionMetadata as BasicFunctionMetadata, type QueryPageResult, type QueryPagination, type QuerySort, type QueryWrapper, type RelationData, type RelationDataModel, StaticMetadata as BasicStaticMetadata } from './basic';
import { FunctionMetadata as TableGroupingFunctionMetadata, type GroupingData, type GroupingField, type GroupingStatisticField, GroupStatisticsEnum, type QueryGroupResult, type QueryGroupsValue, StaticMetadata as TableGroupingStaticMetadata } from './table-grouping';

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
