import {
  ActiveRecord,
  getRealTtype,
  isNeedAppendQueryCondition,
  resolveDynamicDomain,
  RuntimeModel,
  RuntimeModelField,
  RuntimeSearchField,
  translateValueByKey
} from '@oinone/kunlun-engine';
import { ExpressionKeyword } from '@oinone/kunlun-expression';
import {
  deepClone,
  Entity,
  IDslNode,
  IModel,
  isEmptyKeObject,
  isEmptyValue,
  isPromise,
  ModelFieldType
} from '@oinone/kunlun-meta';
import { Condition, ConditionBuilder } from '@oinone/kunlun-request';
import { DEFAULT_TRUE_CONDITION } from '@oinone/kunlun-service';
import {
  BooleanHelper,
  CastHelper,
  RSQLComparisonOperator,
  RSQLHelper,
  RSQLNodeInfo,
  RSQLNodeInfoType,
  RSQLOperators,
  TreeNode
} from '@oinone/kunlun-shared';
import { isBoolean, toString } from 'lodash-es';

const conditionBuilder = ConditionBuilder.getInstance();

const filterRsql = (searchValue: string) => {
  if (searchValue && searchValue.includes("'")) {
    // FIXME 解决中文输入法双拼的时候2个拼音间自动拼接单引号的问题，但是这里会导致字段如果真的有含单引号的情况下无法正常匹配的情况
    searchValue = searchValue.split("'").join('');
  }
  return searchValue;
};
// 搜索条件构造
const getCondition = (
  model: IModel | null,
  content: Record<string, unknown>,
  extraContent = {},
  extraConditions: { leftValue: string[]; operator: string; right: unknown }[] = []
) => {
  const condition = new Condition('1==1');
  const mixedContent = { ...content, ...extraContent };
  Object.keys(mixedContent).forEach((c) => {
    if (mixedContent[c] !== null && mixedContent[c] !== undefined && mixedContent[c] !== '') {
      const val = mixedContent[c];
      const field = model!.modelFields.find((mf) => mf.name === c)!;
      if (typeof val === 'string') {
        if (
          field.ttype === ModelFieldType.String ||
          field.ttype === ModelFieldType.Text ||
          field.ttype === ModelFieldType.Phone ||
          field.ttype === ModelFieldType.Email
        ) {
          condition.and(new Condition(c).like(`%${mixedContent[c] as string}%`));
        } else {
          condition.and(new Condition(c).equal(mixedContent[c] as string));
        }
      } else if (typeof val === 'boolean') {
        condition.and(new Condition(c).equal(mixedContent[c] as string));
      } else if (val instanceof Array) {
        if (val[0] && typeof val[0] === 'object') {
          const m2mOrO2MCD: Condition[] = [];

          if (field.referenceFields) {
            val.forEach((value) => {
              field.referenceFields!.forEach((f) => {
                m2mOrO2MCD.push(new Condition(`${field.name}.${f}`).equal(value[f]));
              });
            });

            const cd = m2mOrO2MCD.map((cond) => cond.toString()).join(' or ');

            condition.and(new Condition(cd));
          }
        } else if (val.length >= 2) {
          // 只有时间日期组件才会进入
          condition.and(new Condition(`${c} >= '${val[0]}' and ${c} <= '${val[1]}'`));
        }
      }
    }
  });
  extraConditions
    .map((c) => {
      if (c.operator === '=like=' || c.operator === '=notlike=') {
        return { ...c, right: `%${c.right}%` };
      }
      return c;
    })
    .forEach((con) => {
      const left = con.leftValue[con.leftValue.length - 1];
      if (con.operator !== 'between') {
        condition.and(new Condition(left).append(con.operator).append(new Condition(`'${con.right}'`).toString()));
      } else {
        condition.and(
          new Condition(left)
            .greaterThanOrEuqalTo((<string[]>con.right)[0])
            .and(new Condition(left).lessThanOrEqualTo((<string[]>con.right)[1]))
        );
      }
    });
  return condition;
};

/**
 * 构造下拉框的搜索条件
 * @param model 关联模型
 * @param searchFieldName 搜索的字段名，可以是逗号分隔的多个字段
 * @param searchValue 搜索的值
 * @param domain 限定条件
 */
const buildSelectSearchCondition = (
  model: RuntimeModel | undefined,
  searchFieldName: string,
  searchValue: string,
  domain?: string
): Condition => {
  const realSearchValue = deepClone(filterRsql(searchValue));
  let condition: Condition | undefined;
  const queryData: Entity = {};
  if (realSearchValue) {
    const modelFieldsMap: Record<string, RuntimeModelField> = {};
    model?.modelFields?.forEach((v) => {
      modelFieldsMap[v.data] = v;
    });
    for (const searchField of searchFieldName.split(',')) {
      const modelField = modelFieldsMap[searchField.trim()];
      if (!modelField) {
        continue;
      }
      const { data } = modelField;
      if (isNeedAppendQueryCondition(modelField)) {
        const nextCondition = new Condition(data).like(realSearchValue);
        if (condition) {
          condition.or(nextCondition);
        } else {
          condition = nextCondition;
        }
      } else {
        queryData[data] = realSearchValue;
      }
    }
  }
  if (!condition) {
    condition = new Condition(DEFAULT_TRUE_CONDITION);
  }
  condition.setConditionBodyData(queryData);
  if (domain) {
    condition.and(new Condition(domain));
  }
  return condition;
};

/**
 * 构造下拉框的搜索条件
 * @param searchFieldName 搜索的字段名，可以是逗号分隔的多个字段
 * @param searchValue 搜索的值
 * @param domain 限定条件
 * @deprecated please using buildSelectSearchCondition
 */
const builderSelectSearchCondition = (searchFieldName: string, searchValue: string, domain?: string): string => {
  const realSearchValue = deepClone(filterRsql(searchValue));
  const searchStr = !realSearchValue
    ? '1==1'
    : searchFieldName
        .split(',')
        .map((item) => {
          const condition = conditionBuilder.condition(item).like(`%${realSearchValue}%`);
          return condition.toString();
        })
        .join(' or ');
  const condition = domain
    ? conditionBuilder.condition(searchStr).and(conditionBuilder.condition(domain)).toString()
    : searchStr;
  return condition;
};

/**
 * 自动填充已选中的值到选项列表的头部,非表达式
 * @param relationFieldKey
 * @param selectedValue
 * @param dataList
 * @param labelFields
 * @param separator labelFields的展示时的分隔符
 */
const autoFillSelectedValueToOptions = (
  relationFieldKey: string,
  selectedValue: any,
  dataList: Entity[],
  labelFields: string[],
  separator = ' '
): Entity[] => {
  const newDataList = !dataList ? [] : [...dataList];
  if (!labelFields || !labelFields.length) {
    labelFields = ['name'];
  }
  return shiftSelectValue(newDataList, selectedValue, relationFieldKey).map((d) => {
    return autoFillByLabelFields(relationFieldKey, d, labelFields, separator);
  });
};

const shiftSelectValue = (newDataList: Entity[], selectedValue: any, relationFieldKey: string) => {
  if (!selectedValue) {
    return newDataList;
  }
  let pendingValue;
  if (Array.isArray(selectedValue)) {
    pendingValue = [...selectedValue];
  } else {
    pendingValue = [selectedValue];
  }
  for (const selectedValueElement of pendingValue) {
    if (
      selectedValueElement &&
      Object.keys(selectedValueElement).length > 0 &&
      newDataList.findIndex((a) => a[relationFieldKey] === (selectedValueElement as any)[relationFieldKey]) === -1
    ) {
      // newDataList.unshift(selectedValueElement);
    }
  }
  return newDataList;
};

/**
 * 根据label变量表达式自动填充已选中的值到选项列表的头部
 * @param relationFieldKey
 * @param selectedValue
 * @param dataList 可选项数据
 * @param xmlOptionLabel xml配的label表达式
 * @param modelLabel 元数据上的label表达式
 * @param optionLabelContextArgs 表达式运行的数据源参数
 */
const autoFillSelectedValueToOptionsByLabel = (
  relationFieldKey: string,
  selectedValues: Entity | Entity[],
  dataList: Entity[] = [],
  xmlOptionLabel?: string,
  modelLabel?: string,
  optionLabelContextArgs?: string
): Entity[] => {
  const newDataList = [...dataList];
  const realOptionLabel = xmlOptionLabel || modelLabel;
  const selectedValueList = Array.isArray(selectedValues) ? selectedValues : [selectedValues];
  selectedValueList?.forEach((selectedValue) => {
    if (
      selectedValue &&
      Object.keys(selectedValue).length > 0 &&
      newDataList.findIndex((a) => {
        if (!a || !selectedValue) {
          return false;
        }
        return a[relationFieldKey] === (selectedValue as any)[relationFieldKey];
      }) === -1
    ) {
      // newDataList.unshift(selectedValue);
    }
  });

  return newDataList.map((optionData) => {
    return autoFillByLabel(relationFieldKey, optionData, realOptionLabel, optionLabelContextArgs);
  });
};

/**
 * 根据labelFields组装展示数据
 * @param relationFieldKey
 * @param optionData
 * @param labelFields
 * @param separator
 */
export const autoFillByLabelFields = (
  relationFieldKey: string,
  optionData: Entity,
  labelFields: string[],
  separator?: string
): Entity => {
  if (isEmptyValue(optionData)) {
    return {};
  }
  if (!labelFields || !labelFields.length) {
    labelFields = ['name'];
  }
  let realLabel = labelFields
    .map((labelField) => {
      return optionData[labelField] || '-';
    })
    .join(!separator ? ' ' : separator);
  if (isEmptyValue(realLabel) || isEmptyValue(realLabel.replaceAll(' ', ''))) {
    realLabel = '-';
  }
  return {
    value: optionData[relationFieldKey],
    label: toString(realLabel)
  };
};

/**
 * 根据label组装展示数据
 * @param relationFieldKey
 * @param optionData
 * @param realOptionLabel
 * @param optionLabelContextArgs
 */
export const autoFillByLabel = (
  relationFieldKey: string,
  optionData: Entity,
  realOptionLabel?: string,
  optionLabelContextArgs?: string
): Entity => {
  if (isEmptyValue(optionData)) {
    return {};
  }
  const expData = {};
  const keys = Object.keys(optionData) as string[];
  for (const key of keys) {
    expData[key] = toString(optionData[key]);
  }
  const realOptionLabelContextArgStr = optionLabelContextArgs || ExpressionKeyword.activeRecord;
  const realOptionLabelContextArgList = realOptionLabelContextArgStr.split(',') as [];
  let realLabel = ''; // 表达式运行后的数据标题
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const fun = new Function(...realOptionLabelContextArgList, `return ${realOptionLabel}`);
  // fixme argList需要枚举提供,例如activeRecord,rootRecord,contextVariable
  try {
    realLabel = fun(expData);
    // js进行"+"运算时, 连续有undefined, 例如undefined+undefined+undefined,结果是NaN
    if (BooleanHelper.isStringBoolean(realLabel)) {
      const labelVal = fun(optionData);
      if (isBoolean(labelVal)) {
        realLabel = labelVal ? translateValueByKey('是') : translateValueByKey('否');
      }
    }
    if (realLabel) {
      realLabel = toString(realLabel).replaceAll('undefined', '');
      realLabel = toString(realLabel).replaceAll('NaN', '');
    }
    if (Number.isNaN(realLabel) || isEmptyValue(realLabel) || isEmptyValue(realLabel.replaceAll(' ', ''))) {
      realLabel = '-';
    }
  } catch (error) {
    console.error(error);
  }
  // 执行表达式后的数据标题为空 ,则按照显示名称, 名称, id依次取值作为展示
  return {
    value: optionData[relationFieldKey],
    label: toString(realLabel)
  };
};

/**
 * 获取xml中配置的labelFields
 * @param dslConfig xml配置
 * @param labelFields 元数据上的labelFields
 */
const fetchLabelFieldsFromXmlConfig = (dslConfig: Entity, labelFields: string[]): string[] => {
  const xmlConfig = dslConfig as IDslNode;
  const children = xmlConfig.children as IDslNode[];
  const xmlLabelFields = [] as string[];
  if (!children || children.length <= 0) {
    return labelFields;
  }
  for (const configChild of children) {
    if (configChild.tagName === 'LABELFIELDS' && configChild.name) {
      xmlLabelFields.push(configChild.name);
    }
  }
  if (xmlLabelFields.length > 0) {
    labelFields = xmlLabelFields;
  }
  dslConfig.labelField = labelFields.join(',');
  return labelFields;
};

/**
 * 判断对象是否为空
 * @param obj
 */
const isEmptyObject = (obj: any): boolean => {
  return isEmptyKeObject(obj);
};

interface QueryExpression {
  leftValue: string[];
  operator: string;
  right: unknown;
}

const parseActionDomain = (model: IModel, domain: string) => {
  const root = RSQLHelper.parse(
    {
      model: model.model,
      fields: CastHelper.cast(model.modelFields)
    },
    domain
  );
  const searchBody = {};
  const searchConditions: QueryExpression[] = [];
  if (root) {
    const stack: TreeNode<RSQLNodeInfo>[] = [];
    traversalRSQLNode(root, searchBody, searchConditions, stack);
    stack.forEach((node) => {
      const nodeInfo = node.value;
      if (nodeInfo) {
        const { operator, selector, args } = nodeInfo;
        searchConditions.push({
          leftValue: [selector!],
          operator: operator!.symbol,
          right: args![0]
        });
      }
    });
  }
  return {
    searchBody,
    searchConditions
  };
};

const traversalRSQLNode = (
  node: TreeNode<RSQLNodeInfo>,
  searchBody: ActiveRecord,
  searchCondition: QueryExpression[],
  stack: TreeNode<RSQLNodeInfo>[]
): void => {
  const type = node.value?.type;
  if (type == null) {
    return;
  }
  switch (type) {
    case RSQLNodeInfoType.AND:
      for (const child of node.children) {
        traversalRSQLNode(child, searchBody, searchCondition, stack);
      }
      break;
    case RSQLNodeInfoType.OR:
      // 不支持 or
      return;
    case RSQLNodeInfoType.COMPARISON: {
      const nodeInfo = node.value;
      if (nodeInfo) {
        const modelField = CastHelper.cast<RuntimeSearchField>(nodeInfo.field);
        if (!modelField) {
          return;
        }
        const { operator: fieldOperator } = modelField;
        const realTtype = getRealTtype(modelField);
        if (!realTtype) {
          return;
        }
        const { selector, operator, args } = nodeInfo;
        if (!selector || !operator || !args) {
          return;
        }
        if (fieldOperator) {
          if (operator.isSymbolEquals(fieldOperator)) {
            [searchBody[selector]] = args;
          } else {
            searchCondition.push({
              leftValue: [selector],
              operator: operator.symbol,
              right: args[0]
            });
          }
          return;
        }
        switch (realTtype) {
          case ModelFieldType.Integer:
          case ModelFieldType.Long:
          case ModelFieldType.Float:
          case ModelFieldType.Boolean:
          case ModelFieldType.Currency:
            numberRSQLParameterProcess(node, searchBody, searchCondition, stack);
            break;
          case ModelFieldType.String:
          case ModelFieldType.Text:
          case ModelFieldType.HTML:
          case ModelFieldType.Phone:
          case ModelFieldType.Email:
            stringRSQLParameterProcess(node, searchBody, searchCondition);
            break;
          case ModelFieldType.DateTime:
          case ModelFieldType.Date:
          case ModelFieldType.Time:
          case ModelFieldType.Year:
            datetimeRSQLParameterProcess(node, searchBody, searchCondition, stack);
            break;
          case ModelFieldType.Enum:
          case ModelFieldType.MultiEnum:
            enumerationRSQLParameterProcess(node, searchBody, searchCondition);
            break;
        }
      }
      break;
    }
  }
};

const numberRSQLParameterProcess = (
  node: TreeNode<RSQLNodeInfo>,
  searchBody: ActiveRecord,
  searchCondition: QueryExpression[],
  stack: TreeNode<RSQLNodeInfo>[]
) => {
  const { selector, operator, args } = node.value!;
  switch (operator!) {
    case RSQLOperators.EQUAL:
    case RSQLOperators.COLUMN_EQUAL:
      [searchBody[selector!]] = args!;
      break;
    case RSQLOperators.IN:
      searchBody[selector!] = args!;
      break;
    case RSQLOperators.NOT_IN:
      searchCondition.push({
        leftValue: [selector!],
        operator: operator!.symbol,
        right: args
      });
      break;
    case RSQLOperators.GREATER_THAN_OR_EQUAL:
    case RSQLOperators.LESS_THAN_OR_EQUAL:
    case RSQLOperators.NOT_EQUAL:
    case RSQLOperators.COLUMN_NOT_EQUAL:
    case RSQLOperators.GREATER_THAN:
    case RSQLOperators.LESS_THAN:
      searchCondition.push({
        leftValue: [selector!],
        operator: operator!.symbol,
        right: args![0]
      });
      break;
  }
};

const stringRSQLParameterProcess = (
  node: TreeNode<RSQLNodeInfo>,
  searchBody: ActiveRecord,
  searchCondition: QueryExpression[]
) => {
  const { selector, operator, args } = node.value!;
  switch (operator!) {
    case RSQLOperators.LIKE:
      [searchBody[selector!]] = args!;
      break;
    case RSQLOperators.EQUAL:
    case RSQLOperators.NOT_EQUAL:
    case RSQLOperators.COLUMN_EQUAL:
    case RSQLOperators.COLUMN_NOT_EQUAL:
    case RSQLOperators.LIKE_RIGHT:
    case RSQLOperators.LIKE_LEFT:
    case RSQLOperators.NOT_LIKE:
    case RSQLOperators.NOT_LIKE_RIGHT:
    case RSQLOperators.NOT_LIKE_LEFT:
      searchCondition.push({
        leftValue: [selector!],
        operator: operator!.symbol,
        right: args![0]
      });
      break;
  }
};

const datetimeRSQLParameterProcess = (
  node: TreeNode<RSQLNodeInfo>,
  searchBody: ActiveRecord,
  searchCondition: QueryExpression[],
  stack: TreeNode<RSQLNodeInfo>[]
) => {
  const { selector, operator, args } = node.value!;
  switch (operator!) {
    case RSQLOperators.EQUAL:
    case RSQLOperators.COLUMN_EQUAL:
      [searchBody[selector!]] = args!;
      break;
    case RSQLOperators.GREATER_THAN_OR_EQUAL:
    case RSQLOperators.LESS_THAN:
      rangeRSQLParameterProcess(node, searchBody, searchCondition, stack);
      break;
    case RSQLOperators.GREATER_THAN:
    case RSQLOperators.LESS_THAN_OR_EQUAL:
    case RSQLOperators.NOT_EQUAL:
    case RSQLOperators.COLUMN_NOT_EQUAL:
      searchCondition.push({
        leftValue: [selector!],
        operator: operator.symbol,
        right: args![0]
      });
      break;
  }
};

const enumerationRSQLParameterProcess = (
  node: TreeNode<RSQLNodeInfo>,
  searchBody: ActiveRecord,
  searchCondition: QueryExpression[]
) => {
  const { selector, operator, args } = node.value!;
  switch (operator!) {
    case RSQLOperators.EQUAL:
    case RSQLOperators.COLUMN_EQUAL:
      [searchBody[selector!]] = args!;
      break;
    case RSQLOperators.IN:
    case RSQLOperators.HAS:
      searchBody[selector!] = args!;
      break;
    case RSQLOperators.BIT:
    case RSQLOperators.NOT_IN:
    case RSQLOperators.NOT_HAS:
    case RSQLOperators.NOT_BIT:
      searchCondition.push({
        leftValue: [selector!],
        operator: operator!.symbol,
        right: args
      });
      break;
    case RSQLOperators.NOT_EQUAL:
      searchCondition.push({
        leftValue: [selector!],
        operator: operator.symbol,
        right: args![0]
      });
      break;
  }
};

const rangeRSQLParameterProcess = (
  node: TreeNode<RSQLNodeInfo>,
  searchBody: ActiveRecord,
  searchCondition: QueryExpression[],
  stack: TreeNode<RSQLNodeInfo>[]
) => {
  const { selector, operator, args } = node.value!;
  switch (operator!) {
    case RSQLOperators.GREATER_THAN_OR_EQUAL: {
      const res = findRangeRSQLParameter(stack, selector!, RSQLOperators.LESS_THAN);
      if (res) {
        const { node: leNode, index } = res;
        searchBody[selector!] = [args?.[0], leNode.value?.args?.[0]];
        stack.splice(index, 1);
      } else {
        stack.push(node);
      }
      break;
    }
    case RSQLOperators.LESS_THAN: {
      const res = findRangeRSQLParameter(stack, selector!, RSQLOperators.GREATER_THAN_OR_EQUAL);
      if (res) {
        const { node: geNode, index } = res;
        searchBody[selector!] = [geNode.value?.args?.[0], args?.[0]];
        stack.splice(index, 1);
      } else {
        stack.push(node);
      }
      break;
    }
  }
};

const findRangeRSQLParameter = (
  stack: TreeNode<RSQLNodeInfo>[],
  selector: string,
  operator: RSQLComparisonOperator
): { node: TreeNode<RSQLNodeInfo>; index: number } | undefined => {
  const len = stack.length;
  for (let i = 0; i < len; i++) {
    const item = stack[i];
    const nodeInfo = item.value;
    if (nodeInfo!.selector === selector && operator.equals(nodeInfo!.operator)) {
      return {
        node: item,
        index: i
      };
    }
  }
};

/**
 * 解析action上的domain到默认搜索条件
 * @param model
 * @param domain
 */
const parseActionDomain4search = (model: IModel, domain: string) => {
  let searchBody = {};
  let searchConditions: QueryExpression[] = [];
  if (domain) {
    domain = resolveDynamicDomain(domain, {}, {}, {});
    const { searchBody: rs, searchConditions: rsc } = parseActionDomain(model, domain);
    searchBody = rs;
    searchConditions = rsc;
  }
  return { searchBody, searchConditions };
};

export {
  isPromise,
  filterRsql,
  getCondition,
  buildSelectSearchCondition,
  builderSelectSearchCondition,
  autoFillSelectedValueToOptions,
  autoFillSelectedValueToOptionsByLabel,
  fetchLabelFieldsFromXmlConfig,
  isEmptyObject,
  parseActionDomain4search
};
