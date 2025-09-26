import { ModelCache, QueryGroupResult } from '@oinone/kunlun-engine';
import { IModelField, ModelFieldType, SYSTEM_MODULE_NAME } from '@oinone/kunlun-meta';
import { ObjectValue, RequestContext } from '@oinone/kunlun-request';
import { buildSingleItemParam, EDirection, http } from '@oinone/kunlun-service';

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

interface GroupParams {
  deep: number;
  currentPage: number;
  size: number;
  model: string;
  groupFields: {
    field: string;
    orderType: EDirection;
  }[];
  expandGroupPaths?: {
    nodeList: {
      field: string;
      value: unknown;
    }[];
  }[];
  sort?: {
    orders?: {
      field: string;
      direction: EDirection;
    }[];
  };
  queryWrapper?: {
    queryData?: ObjectValue;
    rsql?: string;
  };
  variables?: ObjectValue;
  context?: RequestContext;
}

const groupModelFields = [
  { name: 'model', ttype: ModelFieldType.String },
  {
    name: 'groupFields',
    ttype: ModelFieldType.OneToMany,
    modelFields: [
      {
        name: 'field',
        ttype: ModelFieldType.String
      },
      {
        name: 'orderType',
        ttype: ModelFieldType.Enum
      }
    ]
  },
  {
    name: 'expandGroupPaths',
    ttype: ModelFieldType.OneToMany,
    modelFields: [
      {
        name: 'nodeList',
        ttype: ModelFieldType.OneToMany,
        modelFields: [
          { name: 'field', ttype: ModelFieldType.String },
          { name: 'value', ttype: ModelFieldType.OBJ }
        ]
      },
      {
        name: 'statisticFieldMap',
        ttype: ModelFieldType.Map
      }
    ]
  },
  {
    name: 'statisticFields',
    ttype: ModelFieldType.OneToMany,
    modelFields: [
      {
        name: 'field',
        ttype: ModelFieldType.String
      },
      {
        name: 'statisticType',
        ttype: ModelFieldType.Enum
      }
    ]
  },
  {
    name: 'sortFields',
    ttype: ModelFieldType.OneToMany,
    modelFields: [
      {
        name: 'field',
        ttype: ModelFieldType.String
      },
      {
        name: 'orderType',
        ttype: ModelFieldType.Enum
      }
    ]
  },
  {
    name: 'queryWrapper',
    ttype: ModelFieldType.ManyToOne,
    modelFields: [
      { name: 'rsql', ttype: ModelFieldType.String },
      {
        name: 'queryData',
        ttype: ModelFieldType.Map
      }
    ]
  }
] as IModelField[];

const pageModelFields = [
  {
    name: 'currentPage',
    ttype: ModelFieldType.Integer
  },
  {
    name: 'size',
    ttype: ModelFieldType.Integer
  },
  {
    name: 'sort',
    ttype: ModelFieldType.ManyToOne,
    modelFields: [
      {
        name: 'orders',
        ttype: ModelFieldType.OneToMany,
        modelFields: [
          {
            name: 'field',
            ttype: ModelFieldType.String
          },
          {
            name: 'direction',
            ttype: ModelFieldType.Enum
          }
        ]
      }
    ]
  }
] as IModelField[];

async function generateGroupsString(level: number) {
  if (level < 1) {
    return '';
  }

  const hasValueField = !!(await ModelCache.get('base.GroupInfo'))?.modelFields.some((v) => v.data === 'value');

  const baseContent = `
          isLeaf
          field
          dataCount
          ${hasValueField ? 'value' : ''}
          valueStr
          dataListStr`;

  function buildNestedGroups(currentLevel, maxLevel) {
    let content = baseContent;
    if (currentLevel < maxLevel) {
      content += `\n groups {${buildNestedGroups(currentLevel + 1, maxLevel)}\n }`;
    }
    return content;
  }

  return `groups {${buildNestedGroups(1, level)}\n        }`;
}

/**
 * 查询分组视图数据
 */
export const fetchGroupPage = async (options: GroupParams) => {
  const groupsGql = await generateGroupsString(options.deep);

  const groupStr = await buildSingleItemParam(groupModelFields, options as any);
  const pageStr = await buildSingleItemParam(pageModelFields, options as any);

  const gql = `{
    groupingQuery {
      fetchGroupPage(
        group: ${groupStr}
        page: ${pageStr}
      ) {
        totalElements
        totalPages
        totalDataCount
        ${groupsGql}
      }
    }
  }`;

  const result = await http.query<QueryGroupResult>(SYSTEM_MODULE_NAME.BASE, gql, options.variables, options.context);
  return result.data.groupingQuery.fetchGroupPage;
};

/**
 * 查询分组节点下所有的数据源(懒加载)
 */
export const fetchGroupStatistic = async (options: Partial<GroupParams>): Promise<{ expandGroupDataStr: string[] }> => {
  const groupStr = await buildSingleItemParam(groupModelFields, options);
  const gql = `{
    groupingQuery {
      fetchGroupStatistic(
        group: ${groupStr}
      ) {
        expandGroupDataStr
      }
    }
  }`;

  const result = await http.query<{ expandGroupDataStr: string[] }>(
    SYSTEM_MODULE_NAME.BASE,
    gql,
    options.variables,
    options.context
  );
  return result.data.groupingQuery.fetchGroupStatistic;
};

/**
 * 查询分组节点下所有的数据源(懒加载)
 */
export const fetchGroupData = async (options: Partial<GroupParams>): Promise<{ expandGroupDataStr: string[] }> => {
  const groupStr = await buildSingleItemParam(groupModelFields, options);
  const gql = `{
    groupingQuery {
      fetchGroupData(
        group: ${groupStr}
      ) {
        expandGroupDataStr
      }
    }
  }`;

  const result = await http.query<{ expandGroupDataStr: string[] }>(
    SYSTEM_MODULE_NAME.BASE,
    gql,
    options.variables,
    options.context
  );
  return result.data.groupingQuery.fetchGroupData;
};
