import { ModelFieldType, SYSTEM_MODULE, SYSTEM_MODULE_NAME } from '@oinone/kunlun-meta';
import { EDirection } from '@oinone/kunlun-service';
import { RuntimeModel } from '../../../runtime-metadata';
import { MetadataHelper } from '../../util';
import { StaticMetadata as BasicStaticMetadata } from '../basic';

export interface GroupingData {
  field: string;
  value: unknown;
  data: string;
  isLeaf: boolean;
  groups?: GroupingData[];
}

export interface GroupingField {
  field: string;
  value?: unknown;
  direction: EDirection;
}

export enum GroupStatisticsEnum {
  NONE = 'NONE', // 不展示
  COUNT = 'COUNT', // 记录总数
  NULL = 'NULL', // 未填写
  NOT_NULL = 'NOT_NULL', // 已填写
  UNIQUE = 'UNIQUE', // 唯一值
  NULL_PERCENT = 'NULL_PERCENT', // 未填写占比
  NOT_NULL_PERCENT = 'NOT_NULL_PERCENT', // 已填写占比
  UNIQUE_PERCENT = 'UNIQUE_PERCENT', // 唯一值占比
  EARLIEST_TIME = 'EARLIEST_TIME', // 最早时间
  LATEST_TIME = 'LATEST_TIME', // 最晚时间
  TIME_RANGE_DAY = 'TIME_RANGE_DAY', // 时间范围（日）
  TIME_RANGE_MONTH = 'TIME_RANGE_MONTH', // 时间范围(月)
  TIME_RANGE_YEAR = 'TIME_RANGE_YEAR', // 时间范围(日)
  SUM = 'SUM', // 求和
  AVERAGE = 'AVERAGE', // 平均值
  MEDIAN = 'MEDIAN', // 中位数
  MAX = 'MAX', // 最大值
  MIN = 'MIN' // 最大值
}

export interface GroupingStatisticField {
  field: string;
  statisticMethod: GroupStatisticsEnum;
}

export interface QueryGroupsValue {
  isLeaf: boolean;
  field: string;
  dataCount: number;
  dataListStr?: string;
  value?: unknown;
  groups?: QueryGroupsValue[];
}

export interface QueryGroupResult {
  totalElements: string;
  totalPages: string;
  totalDataCount: string;
  groups?: GroupingData[];
}

export namespace StaticMetadata {
  export const GroupingFieldModel = 'grouping.GroupingField';

  export const GroupingFieldName = 'groupingField';

  export const GroupingField: RuntimeModel = {
    model: GroupingFieldModel,
    name: GroupingFieldName,
    module: SYSTEM_MODULE.GROUPING,
    moduleName: SYSTEM_MODULE_NAME.GROUPING,
    modelActions: [],
    modelFields: [
      MetadataHelper.buildSimpleModelField(GroupingFieldModel, GroupingFieldName, {
        data: 'field',
        ttype: ModelFieldType.String
      }),
      MetadataHelper.buildSimpleModelField(GroupingFieldModel, GroupingFieldName, {
        data: 'value',
        ttype: ModelFieldType.OBJ
      }),
      MetadataHelper.buildSimpleModelField(GroupingFieldModel, GroupingFieldName, {
        data: 'direction',
        ttype: ModelFieldType.Enum
      })
    ]
  };

  export const GroupingStatisticFieldModel = 'grouping.GroupingStatisticField';

  export const GroupingStatisticFieldName = 'groupingStatisticField';

  export const GroupingStatisticField: RuntimeModel = {
    model: GroupingStatisticFieldModel,
    name: GroupingStatisticFieldName,
    module: SYSTEM_MODULE.GROUPING,
    moduleName: SYSTEM_MODULE_NAME.GROUPING,
    modelActions: [],
    modelFields: [
      MetadataHelper.buildSimpleModelField(GroupingStatisticFieldModel, GroupingStatisticFieldName, {
        data: 'field',
        ttype: ModelFieldType.String
      }),
      MetadataHelper.buildSimpleModelField(GroupingStatisticFieldModel, GroupingStatisticFieldName, {
        data: 'statisticMethod',
        ttype: ModelFieldType.Enum
      })
    ]
  };

  export const TableGroupingWrapperModel = 'grouping.TableGroupingWrapper';

  export const TableGroupingWrapperName = 'tableGroupingWrapper';

  export const TableGroupingWrapper: RuntimeModel = {
    model: TableGroupingWrapperModel,
    name: TableGroupingWrapperName,
    module: SYSTEM_MODULE.GROUPING,
    moduleName: SYSTEM_MODULE_NAME.GROUPING,
    modelActions: [],
    modelFields: [
      MetadataHelper.buildSimpleModelField(TableGroupingWrapperModel, TableGroupingWrapperName, {
        data: 'queryWrapper',
        ttype: ModelFieldType.ManyToOne,
        references: BasicStaticMetadata.ConditionWrapperModel,
        referencesModel: BasicStaticMetadata.ConditionWrapper
      }),
      MetadataHelper.buildSimpleModelField(TableGroupingWrapperModel, TableGroupingWrapperName, {
        data: 'fields',
        ttype: ModelFieldType.OneToMany,
        references: GroupingFieldModel,
        referencesModel: GroupingField
      }),
      MetadataHelper.buildSimpleModelField(TableGroupingWrapperModel, TableGroupingWrapperName, {
        data: 'queryRelationFields',
        ttype: ModelFieldType.String,
        multi: true
      }),
      MetadataHelper.buildSimpleModelField(TableGroupingWrapperModel, TableGroupingWrapperName, {
        data: 'statisticField',
        ttype: ModelFieldType.ManyToOne,
        references: GroupingStatisticFieldModel,
        referencesModel: GroupingStatisticField
      })
    ]
  };
}
