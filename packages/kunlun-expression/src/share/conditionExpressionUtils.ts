import { ExpressionKeyword } from '@kunlun/expression';
import { isNumberTtype, ModelFieldSerializeType } from '@kunlun/meta';
import { DefaultComparisonOperator } from '@kunlun/request';
import {
  AUTO_SINGLE_QUOTE_OPERATOR_LIST,
  BooleanConditionComparisonOperator,
  ConditionRsqlFunctionMap,
  ExpressionDefinitionType,
  ExpressionItemType,
  IExpressionItem,
  IExpressionOption,
  IExpressionQuoteType,
  IExpSelectOption,
  IVariableItem,
  IVariableValueType,
  NoArgFunBooleanOperatorList,
  NoRightCompareBooleanOperatorList,
  NoRightCompareRsqlOperatorList,
  OneArgFunBooleanOperatorList,
  TwoArgLeftRightFunBooleanOperatorList,
  VariableItemType,
  WrapperCompareBooleanOperatorList,
  WrapperCompareRsqlOperatorList
} from '../types';
import {
  autoAddQuote,
  createApiNameVariableListStr,
  createDefaultVariableItem,
  createDisplayNameVariableListStr,
  createValueVariableListStr,
  getValidVariableItemList
} from './expressionVariableUtils';
import {
  createDefaultExpressionItem,
  createExpressionCommon,
  isConditionExpression,
  translateCompareOperatorDisplayName,
  translateOperator
} from './expressionUtils';

/**
 * 字段变量
 */
function createDefaultFieldExpressionItem(
  fieldOptions: IExpSelectOption[],
  index = 0,
  type: ExpressionDefinitionType
): IExpressionItem[] {
  const expressionItem = createDefaultExpressionItem(type);
  expressionItem.valueList = createDefaultFieldVariableItems(fieldOptions, index);
  return [expressionItem];
}

function createDefaultFieldVariableItems(fieldOptions: IExpSelectOption[], index = 0): IVariableItem[] {
  if (fieldOptions && fieldOptions.length) {
    const field = fieldOptions[index];
    return [
      {
        ...createDefaultVariableItem(),
        apiName: field.name,
        displayName: field.displayName,
        value: field.name,
        ttype: field.ttype!,
        multi: field.multi,
        bitEnum: field.storeSerialize == ModelFieldSerializeType.BIT
      }
    ];
  }
  return [createDefaultVariableItem()];
}

function createConditionExpressionDisplayName(
  expressionItemList: IExpressionItem[],
  expressionOption: IExpressionOption
) {
  return createExpressionCommon(expressionItemList, expressionOption, (expressionItemList) => {
    return expressionItemList
      .map((a, index) => {
        let operator = a.showOperator ? ` ${translateOperator(a.operator!, expressionOption)}` : '';
        const isLast = index === expressionItemList.length - 1;
        const nextRow = expressionItemList[index + 1];
        // 如果下一行是无效行 或 总的最后一行 或 括号内最后一行，则连接操作符不需要
        if (isLast || nextRow.type === ExpressionItemType.RIGHT_BRACKET) {
          operator = '';
        }
        if (a.type === ExpressionItemType.VARIABLE) {
          return (
            getCompareExp4DisplayName(
              getValidVariableItemList(a.valueList!),
              a.compareOperator!,
              getValidVariableItemList(a.compareValueList!),
              a.compareOperatorOptions!,
              expressionOption
            ) + operator
          );
        }
        if (a.type === ExpressionItemType.LEFT_BRACKET) {
          return '(';
        }
        if (a.type === ExpressionItemType.RIGHT_BRACKET) {
          return `)${operator}`;
        }
        return '';
      })
      .join(' ');
  });
}

function createConditionExpressionValue(expressionItemList: IExpressionItem[], expressionOption: IExpressionOption) {
  return createExpressionCommon(expressionItemList, expressionOption, (expressionItemList) => {
    return expressionItemList
      .map((a, index) => {
        let operator = a.showOperator ? ` ${a.operator!}` : '';
        const isLast = index === expressionItemList.length - 1;
        const nextRow = expressionItemList[index + 1];
        // 如果下一行是无效行 或 总的最后一行 或 括号内最后一行，则连接操作符不需要
        if (isLast || nextRow.type === ExpressionItemType.RIGHT_BRACKET) {
          operator = '';
        }
        if (a.type === ExpressionItemType.VARIABLE) {
          return (
            getCompareExp4Value(
              getValidVariableItemList(a.valueList!),
              a.compareOperator!,
              getValidVariableItemList(a.compareValueList!),
              expressionOption
            ) + operator
          );
        }
        if (a.type === ExpressionItemType.LEFT_BRACKET) {
          return '(';
        }
        if (a.type === ExpressionItemType.RIGHT_BRACKET) {
          return `)${operator}`;
        }
        return '';
      })
      .join(' ');
  });
}

function createConditionExpressionApiName(expressionItemList: IExpressionItem[], expressionOption: IExpressionOption) {
  // console.log('createConditionExpressionApiName', expressionItemList, expressionOption)
  return createExpressionCommon(expressionItemList, expressionOption, (expressionItemList) => {
    return expressionItemList
      .map((a, index) => {
        let operator = a.showOperator ? ` ${a.operator!}` : '';
        const isLast = index === expressionItemList.length - 1;
        const nextRow = expressionItemList[index + 1];
        // 如果下一行是无效行 或 总的最后一行 或 括号内最后一行，则连接操作符不需要
        if (isLast || nextRow.type === ExpressionItemType.RIGHT_BRACKET) {
          operator = '';
        }
        if (a.type === ExpressionItemType.VARIABLE) {
          return (
            getCompareExp4ApiName(
              getValidVariableItemList(a.valueList!),
              a.compareOperator ? a.compareOperator : '',
              getValidVariableItemList(a.compareValueList!),
              expressionOption
            ) + operator
          );
        }
        if (a.type === ExpressionItemType.LEFT_BRACKET) {
          return '(';
        }
        if (a.type === ExpressionItemType.RIGHT_BRACKET) {
          return `)${operator}`;
        }
        return '';
      })
      .join(' ');
  });
}

function isWrapperCompareOperator(
  operator: string | DefaultComparisonOperator | BooleanConditionComparisonOperator,
  expressionOption: IExpressionOption
) {
  return (
    expressionOption.type === ExpressionDefinitionType.RSQL_CONDITION
      ? WrapperCompareRsqlOperatorList
      : WrapperCompareBooleanOperatorList
  ).includes(operator.toString());
}

function isNoRightCompareExpOperator(
  operator: string | DefaultComparisonOperator | BooleanConditionComparisonOperator,
  expressionOption: IExpressionOption
) {
  return (
    expressionOption.type === ExpressionDefinitionType.RSQL_CONDITION
      ? NoRightCompareRsqlOperatorList
      : NoRightCompareBooleanOperatorList
  ).includes(operator.toString());
}

// 是否单参数且左边为入参的运算，例如：left IS_BLANK 转换为 IS_BLANK(left)
function isOneArgFunExpOperator(
  operator: string | DefaultComparisonOperator | BooleanConditionComparisonOperator,
  expressionOption: IExpressionOption
) {
  return (
    expressionOption.type === ExpressionDefinitionType.RSQL_CONDITION ? [] : OneArgFunBooleanOperatorList
  ).includes(operator.toString());
}

/**
 * 是否为无需右边compareValueList的值作为参数的函数
 * 包括单参(参数为left)和无参数(比如获取当前时间NOW())情况
 * @param operator
 * @param expressionOption
 */
function isNoCompareExpOperator(
  operator: string | DefaultComparisonOperator | BooleanConditionComparisonOperator,
  expressionOption: IExpressionOption
) {
  if (!isConditionExpression(expressionOption.type)) {
    return false;
  }
  return (
    ExpressionDefinitionType.RSQL_CONDITION === expressionOption.type
      ? [...NoRightCompareRsqlOperatorList]
      : [...NoArgFunBooleanOperatorList, ...OneArgFunBooleanOperatorList]
  ).includes(operator.toString());
}

// 是否双参数运算，例如：left STARTS_WITH right 转换为 STARTS_WITH(left, right)
function isTwoArgLeftRightFunExpOperator(
  operator: string | DefaultComparisonOperator | BooleanConditionComparisonOperator,
  expressionOption: IExpressionOption
) {
  return (
    expressionOption.type === ExpressionDefinitionType.RSQL_CONDITION ? [] : TwoArgLeftRightFunBooleanOperatorList
  ).includes(operator.toString());
}

function getCompareExp4Value(
  valueList: IVariableItem[],
  operator: string,
  compareValueList: IVariableItem[],
  expressionOption: IExpressionOption
) {
  if (expressionOption.type === ExpressionDefinitionType.BOOLEAN_CONDITION) {
    return getBooleanCompareExp4Value(
      valueList,
      operator,
      compareValueList,
      expressionOption,
      valueList && valueList[0]
    );
  }
  let left = createValueVariableListStr(valueList!, {
    ...expressionOption,
    isRsqlLeft: expressionOption.type === ExpressionDefinitionType.RSQL_CONDITION
  });
  // 下面的Condition会处理字符串类型的right,所以quoteType需要在这里重置为NONE
  let right = compareValueList
    ? createValueVariableListStr(
        compareValueList!,
        {
          ...expressionOption,
          isBetweenInBrackets: true,
          quoteType: IExpressionQuoteType.NONE
        } as IExpressionOption,
        valueList && valueList[0]
      )
    : '';
  if (left.startsWith(ExpressionKeyword.activeRecord)) {
    left = left.substring(ExpressionKeyword.activeRecord.length + 1);
  }
  const leftFieldItem = valueList[0]!;
  let isPreprocess = true;
  // 右边是否为字段
  let isRightColumn = false;
  const isLeftBitEnum = leftFieldItem.bitEnum || false;
  if (compareValueList && compareValueList.length === 1) {
    if (
      [VariableItemType.VARIABLE, VariableItemType.FIELD].includes(compareValueList[0].type) ||
      (valueList && isNumberTtype(leftFieldItem.ttype))
    ) {
      isPreprocess = false;
    }
    if ([VariableItemType.FIELD].includes(compareValueList[0].type)) {
      isRightColumn = true;
    }
    if ([VariableItemType.VARIABLE].includes(compareValueList[0].type) && expressionOption.variableCustomMethod) {
      right = expressionOption.variableCustomMethod(right, IVariableValueType.RIGHT, {
        valueList,
        operator,
        compareValueList,
        expressionOption
      });
    }
  }

  // const compareOperationOptions = getRsqlCompareOperatorOptions(leftFieldItem, leftFieldItem.type);
  // const compareOperationOption = compareOperationOptions.find((a) => a.value === operator);
  // console.log('getCompareExp4Value', left, operator, compareOperationOption, right, valueList, compareValueList);
  const conditionRsqlFunction = ConditionRsqlFunctionMap.get(operator as DefaultComparisonOperator);
  if (conditionRsqlFunction) {
    return conditionRsqlFunction(left, operator, right, isPreprocess, leftFieldItem, compareValueList);
  }
  return `${left} ${operator} ${right}`;
}

function getBooleanCompareExp4Value(
  valueList: IVariableItem[],
  operator: string,
  compareValueList: IVariableItem[],
  expressionOption: IExpressionOption,
  leftVariableItem: IVariableItem
) {
  let left = createValueVariableListStr(valueList!, {
    ...expressionOption,
    isRsqlLeft: expressionOption.type === ExpressionDefinitionType.RSQL_CONDITION
  });
  if (
    valueList &&
    valueList.length === 1 &&
    (isOneArgFunExpOperator(operator, expressionOption) || isTwoArgLeftRightFunExpOperator(operator, expressionOption))
  ) {
    if ([VariableItemType.VARIABLE].includes(valueList[0].type) && expressionOption.variableCustomMethod) {
      left = expressionOption.variableCustomMethod(left, IVariableValueType.LEFT, {
        valueList,
        operator,
        compareValueList,
        expressionOption
      });
      if (
        !expressionOption.isFrontend &&
        [...AUTO_SINGLE_QUOTE_OPERATOR_LIST].includes(operator as BooleanConditionComparisonOperator)
      ) {
        left = autoAddQuote(left, IExpressionQuoteType.SINGLE);
      }
    }
  }
  let right = compareValueList
    ? createValueVariableListStr(
        compareValueList!,
        { ...expressionOption, isBetweenInBrackets: true, quoteType: IExpressionQuoteType.SINGLE } as IExpressionOption,
        leftVariableItem
      )
    : '';
  // if (left.startsWith(ExpressionKeyword.activeRecord)) {
  //   left = left.substring(ExpressionKeyword.activeRecord.length + 1);
  // }
  // if (leftVariableItem && compareValueList && compareValueList[0].type === VariableItemType.STRING) {
  //   const leftJoinTtype = leftVariableItem.ttype;
  //   if (isDateTtype(leftJoinTtype)) {
  //     const dateFormat = JavaDateTimeFormatEnum[leftJoinTtype];
  //     right = `${STR_TO_DATE_FUN}(${right}, '${dateFormat}')`;
  //   }
  // }
  if (compareValueList && compareValueList.length === 1) {
    if ([VariableItemType.VARIABLE].includes(compareValueList[0].type) && expressionOption.variableCustomMethod) {
      right = expressionOption.variableCustomMethod(right, IVariableValueType.RIGHT, {
        valueList,
        operator,
        compareValueList,
        expressionOption
      });
      if (
        !expressionOption.isFrontend &&
        [...AUTO_SINGLE_QUOTE_OPERATOR_LIST].includes(operator as BooleanConditionComparisonOperator)
      ) {
        right = autoAddQuote(right, IExpressionQuoteType.SINGLE);
      }
    }
  }
  return getCompareExpCommon(left, operator, right, expressionOption);
}

function getCompareExp4ApiName(
  valueList: IVariableItem[],
  operator: string,
  compareValueList: IVariableItem[],
  expressionOption: IExpressionOption
) {
  let left = createApiNameVariableListStr(valueList!, {
    ...expressionOption,
    isBetweenInBrackets: true,
    quoteType: IExpressionQuoteType.SINGLE
  } as IExpressionOption);
  const leftVariableItem = valueList && valueList[0];
  const right = compareValueList
    ? createApiNameVariableListStr(
        compareValueList!,
        { ...expressionOption, isBetweenInBrackets: true, quoteType: IExpressionQuoteType.SINGLE } as IExpressionOption,
        leftVariableItem
      )
    : '';
  if (left.startsWith(ExpressionKeyword.activeRecord)) {
    left = left.substring(ExpressionKeyword.activeRecord.length + 1);
  }
  return getCompareExpCommon(left, operator, right, expressionOption);
}

function getCompareExpCommon(left: string, operator: string, right: string, expressionOption: IExpressionOption) {
  // console.log('getCompareExpCommon', left, operator, right, expressionOption);
  if (isWrapperCompareOperator(operator, expressionOption)) {
    return `${left} ${operator}(${right})`;
  }
  if (
    isNoRightCompareExpOperator(operator, expressionOption) &&
    expressionOption.type !== ExpressionDefinitionType.BOOLEAN_CONDITION
  ) {
    return `${left} ${operator}`;
  }
  if (isOneArgFunExpOperator(operator, expressionOption)) {
    return `${operator}(${left})`;
  }
  if (isTwoArgLeftRightFunExpOperator(operator, expressionOption)) {
    return `${operator}(${left}, ${right})`;
  }
  return `${left} ${operator} ${right}`;
}

function getCompareExp4DisplayName(
  valueList: IVariableItem[],
  operator: string,
  compareValueList: IVariableItem[],
  compareOperatorOptions: IExpSelectOption[],
  expressionOption: IExpressionOption
) {
  const left = createDisplayNameVariableListStr(valueList!, expressionOption);
  const right = compareValueList
    ? createDisplayNameVariableListStr(
        compareValueList!,
        { ...expressionOption, isBetweenInBrackets: true, quoteType: IExpressionQuoteType.SINGLE } as IExpressionOption,
        valueList && valueList[0]
      )
    : '';
  const translateOpt = translateCompareOperatorDisplayName(operator, compareOperatorOptions, expressionOption);
  // console.log('getCompareExp4DisplayName', left, operator, translateOpt, right);
  if (isWrapperCompareOperator(operator, expressionOption)) {
    return `${left} ${translateOpt}(${right})`;
  }
  if (isNoRightCompareExpOperator(operator, expressionOption)) {
    return `${left} ${translateOpt}`;
  }
  if (isOneArgFunExpOperator(operator, expressionOption)) {
    return `${left} ${translateOpt}`;
  }
  if (isTwoArgLeftRightFunExpOperator(operator, expressionOption)) {
    return `${left} ${translateOpt} ${right}`;
  }
  return `${left} ${translateOpt} ${right}`;
}

export {
  createDefaultFieldExpressionItem,
  createDefaultFieldVariableItems,
  createConditionExpressionDisplayName,
  createConditionExpressionValue,
  createConditionExpressionApiName,
  isNoRightCompareExpOperator,
  isNoCompareExpOperator,
  isOneArgFunExpOperator
};
