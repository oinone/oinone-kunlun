import { deepClone, isEmptyKeObject as isEmptyObject } from '@kunlun/meta';
import { nextTick } from 'vue';
import { isNil } from 'lodash-es';
import {
  BooleanExpressionCompareOperatorList,
  DEFAULT_BOOLEAN_CONDITION_OPT,
  DEFAULT_CONDITION_COMPARE_OPT,
  DEFAULT_CONDITION_OPT,
  DEFAULT_EXPRESSION_OPT,
  ExpressionBooleanLogicOperatorList,
  ExpressionDefinitionType,
  ExpressionItemType,
  ExpressionOperatorConfig,
  ExpressionRsqlCompareOperatorList,
  ExpressionRsqlLogicOperatorList,
  ExpressionTtypeXBooleanCompareOperatorListMap,
  ExpressionTtypeXCompareOperatorListMap,
  ExpressionTtypeXExpressionOperatorListMap,
  IExpressionBlock,
  IExpressionCell,
  IExpressionDefinition,
  IExpressionDisplay,
  IExpressionItem,
  IExpressionOption,
  IExpressionQuoteType,
  IExpressionRow,
  IExpSelectOption,
  IFunction,
  IFunctionArgument,
  IQueryExpressionParam,
  IVariableContextItem,
  IVariableItem,
  VARIABLE_MAX_STRING_LENGTH,
  VariableItemType
} from '../types';
import {
  createApiNameVariableListStr,
  createDefaultVariableItemList,
  createDisplayNameVariableListStr,
  createValueVariableListStr,
  createVariableItemCode,
  expressionCellList2variableItemList,
  isEmptyVariable,
  variableItemList2expressionCellList
} from './expressionVariableUtils';
import { randomNum, translateExpValue } from './utils';
import {
  createConditionExpressionApiName,
  createConditionExpressionDisplayName,
  isNoCompareExpOperator
} from './conditionExpressionUtils';
import { queryExpBuildInFunction } from '../service/modelFunctionService';

export function createDefaultExpressionItem(type: ExpressionDefinitionType): IExpressionItem {
  const isCondition = type !== ExpressionDefinitionType.OPERATION;
  // console.log('createDefaultExpressionItem', type)
  return {
    expCode: createVariableItemCode(),
    checked: true,
    expressionType: type,
    type: ExpressionItemType.VARIABLE,
    value: '',
    // 查询条件表达式这里存的是字段，不需要有空字符串的默认值
    valueList: isCondition ? [] : createDefaultVariableItemList(),
    showOperator: false,
    operatorOptions: getDefaultCompareOperatorOptions(type),
    operator: getDefaultOperator(type),
    compareValueList: isCondition ? createDefaultVariableItemList() : [],
    compareOperator: isCondition ? DEFAULT_CONDITION_COMPARE_OPT : '',
    compareOperatorOptions: getDefaultCompareOperatorOptions(type)
  } as IExpressionItem;
}

const map = new Map<ExpressionDefinitionType, string>();
map.set(ExpressionDefinitionType.OPERATION, DEFAULT_EXPRESSION_OPT);
map.set(ExpressionDefinitionType.RSQL_CONDITION, DEFAULT_CONDITION_OPT);
map.set(ExpressionDefinitionType.BOOLEAN_CONDITION, DEFAULT_BOOLEAN_CONDITION_OPT);

export function getDefaultOperator(type: ExpressionDefinitionType) {
  return map.get(type);
}

export function getDefaultCompareOperatorOptions(
  type: ExpressionDefinitionType,
  variableItem?: IVariableItem,
  variableItemType?: VariableItemType
): IExpSelectOption[] {
  if (type === ExpressionDefinitionType.BOOLEAN_CONDITION) {
    return getBooleanCompareOperatorOptions(variableItem, variableItemType);
  }
  if (type === ExpressionDefinitionType.RSQL_CONDITION) {
    return getRsqlCompareOperatorOptions(variableItem, variableItemType);
  }
  return getExpressionOperatorOptions(variableItem, variableItemType);
}

export function createDefaultExpressionItemList(type: ExpressionDefinitionType): IExpressionItem[] {
  return [createDefaultExpressionItem(type)];
}

export function getExpressionOperatorOptions(
  variableItem?: IVariableItem,
  variableItemType?: VariableItemType
): IExpSelectOption[] {
  const { ttype, multi = false, bitEnum = false } = variableItem || {};
  if (!ttype) {
    return [...ExpressionOperatorConfig];
  }
  const options = ExpressionTtypeXExpressionOperatorListMap[ttype];
  if (!options) {
    return [...ExpressionOperatorConfig];
  }
  return options.filter((a) => operatorListFilter(a, multi, bitEnum, variableItemType));
}

export function getRsqlCompareOperatorOptions(
  variableItem?: IVariableItem,
  variableItemType?: VariableItemType
): IExpSelectOption[] {
  const { ttype, multi = false, bitEnum = false } = variableItem || {};
  if (!ttype) {
    return [...ExpressionRsqlCompareOperatorList];
  }
  const options = ExpressionTtypeXCompareOperatorListMap[ttype];
  if (!options) {
    return [...ExpressionRsqlCompareOperatorList];
  }
  // if (variableItemType === VariableItemType.FIELD) {
  //   return [
  //     {
  //       label: '等于',
  //       value: DefaultComparisonOperator.EQUAL
  //     },
  //     {
  //       label: '不等于',
  //       value: DefaultComparisonOperator.NOT_EQUAL
  //     }
  //   ];
  // }
  return options.filter((a) => operatorListFilter(a, multi, bitEnum, variableItemType));
}

function getBooleanCompareOperatorOptions(
  variableItem?: IVariableItem,
  variableItemType?: VariableItemType
): IExpSelectOption[] {
  const { type, ttype, multi = false, bitEnum = false } = variableItem || {};
  if (!ttype) {
    return [...BooleanExpressionCompareOperatorList];
  }
  const options = ExpressionTtypeXBooleanCompareOperatorListMap[ttype];
  if (!options) {
    return [...BooleanExpressionCompareOperatorList];
  }
  return options.filter((a) => operatorListFilter(a, multi, bitEnum, variableItemType || type));
}

function operatorListFilter(
  option: any,
  multi: boolean | undefined = false,
  bitEnum: boolean | undefined = false,
  variableItemType?: VariableItemType
) {
  if (variableItemType === VariableItemType.FIELD) {
    return option.type === variableItemType;
  }
  multi = isNil(multi) ? false : multi;
  bitEnum = isNil(bitEnum) ? false : bitEnum;
  return (
    (isNil(option.type) || option.type === variableItemType) &&
    (isNil(option.multi) || option.multi === multi) &&
    (isNil(option.bitEnum) || option.bitEnum === bitEnum)
  );
}

export function createDefaultExpressionLeftBracket(type: ExpressionDefinitionType): IExpressionItem {
  return {
    expCode: createVariableItemCode(),
    checked: true,
    expressionType: type,
    type: ExpressionItemType.LEFT_BRACKET,
    value: '(',
    showOperator: false,
    operatorOptions: getDefaultCompareOperatorOptions(type),
    operator: getDefaultOperator(type)
  } as IExpressionItem;
}

export function createDefaultExpressionRightBracket(
  type: ExpressionDefinitionType,
  isHideOperator = false
): IExpressionItem {
  return {
    expCode: createVariableItemCode(),
    checked: true,
    expressionType: type,
    hideCheckbox: true,
    type: ExpressionItemType.RIGHT_BRACKET,
    value: ')',
    showOperator: !isHideOperator,
    operatorOptions: getDefaultCompareOperatorOptions(type),
    operator: getDefaultOperator(type)
  } as IExpressionItem;
}

export function createExpressionDisplayName(
  expressionItemList: IExpressionItem[],
  expressionOption: IExpressionOption
) {
  return createExpressionCommon(expressionItemList, expressionOption, (expressionItemList) => {
    return expressionItemList
      .map((a, index) => {
        let operator = a.showOperator ? ` ${translateOperator(a.operator!, expressionOption)}` : '';
        // 如果下一行是无效行 或 总的最后一行 或 括号内最后一行，则连接操作符不需要
        const isLast = index === expressionItemList.length - 1;
        const nextRow = expressionItemList[index + 1];
        if (isLast || nextRow.type === ExpressionItemType.RIGHT_BRACKET) {
          operator = '';
        }
        if (a.type === ExpressionItemType.VARIABLE) {
          return (
            createDisplayNameVariableListStr(a.valueList!, expressionOption) +
            (a.compareOperator
              ? translateCompareOperatorDisplayName(a.compareOperator, a.compareOperatorOptions, expressionOption)
              : '') +
            (a.compareValueList ? createDisplayNameVariableListStr(a.compareValueList!, expressionOption) : '') +
            operator
          );
        }
        if (a.type === ExpressionItemType.LEFT_BRACKET) {
          return '(';
        }
        if (a.type === ExpressionItemType.RIGHT_BRACKET) {
          return `)${operator}`;
        }
        if (a.type === ExpressionItemType.FUN) {
          return `${a.function?.displayName ? a.function?.displayName : '?'}(${
            !a.function?.argumentList
              ? '?'
              : a.function?.argumentList
                  .map((arg) =>
                    createDisplayNameVariableListStr(arg.variableItemList!, {
                      ...expressionOption,
                      leftJoinTtype: arg.ttype,
                      leftJoinField: { ttype: arg.ttype } as any
                    })
                  )
                  .join(', ')
          })${operator}`;
        }
        return '';
      })
      .join(' ');
  });
}

export function createExpressionValue(expressionItemList: IExpressionItem[], expressionOption: IExpressionOption) {
  return createExpressionCommon(expressionItemList, expressionOption, (expressionItemList) => {
    return expressionItemList
      .map((a, index) => {
        let operator = a.showOperator ? ` ${a.operator!}` : '';
        // 如果下一行是无效行 或 总的最后一行 或 括号内最后一行，则连接操作符不需要
        const isLast = index === expressionItemList.length - 1;
        const nextRow = expressionItemList[index + 1];
        if (isLast || nextRow.type === ExpressionItemType.RIGHT_BRACKET) {
          operator = '';
        }
        if (a.type === ExpressionItemType.VARIABLE) {
          return (
            createValueVariableListStr(a.valueList!, expressionOption) +
            (a.compareOperator
              ? translateCompareOperatorValue(a.compareOperator, a.compareOperatorOptions, expressionOption)
              : '') +
            (a.compareValueList ? createValueVariableListStr(a.compareValueList!, expressionOption) : '') +
            operator
          );
        }
        if (a.type === ExpressionItemType.LEFT_BRACKET) {
          return '(';
        }
        if (a.type === ExpressionItemType.RIGHT_BRACKET) {
          return `)${operator}`;
        }
        if (a.type === ExpressionItemType.FUN) {
          return `${a.function?.name}(${a.function?.argumentList
            .map((arg) =>
              createValueVariableListStr(arg.variableItemList!, {
                ...expressionOption,
                leftJoinTtype: arg.ttype,
                leftJoinField: { ttype: arg.ttype } as any
              })
            )
            .join(', ')})${operator}`;
        }
        return '';
      })
      .join(' ');
  });
}

export function createExpressionApiName(expressionItemList: IExpressionItem[], expressionOption: IExpressionOption) {
  // console.log('createExpressionApiName', expressionItemList);
  return createExpressionCommon(expressionItemList, expressionOption, (expressionItemList) => {
    return expressionItemList
      .map((a, index) => {
        let operator = a.showOperator ? ` ${a.operator!}` : '';
        // 如果下一行是无效行 或 总的最后一行 或 括号内最后一行，则连接操作符不需要
        const isLast = index === expressionItemList.length - 1;
        const nextRow = expressionItemList[index + 1];
        if (isLast || nextRow.type === ExpressionItemType.RIGHT_BRACKET) {
          operator = '';
        }
        if (a.type === ExpressionItemType.VARIABLE) {
          return (
            createApiNameVariableListStr(a.valueList!, expressionOption) +
            (a.compareOperator
              ? translateCompareOperatorValue(a.compareOperator, a.compareOperatorOptions, expressionOption)
              : '') +
            (a.compareValueList ? createApiNameVariableListStr(a.compareValueList!, expressionOption) : '') +
            operator
          );
        }
        if (a.type === ExpressionItemType.LEFT_BRACKET) {
          return '(';
        }
        if (a.type === ExpressionItemType.RIGHT_BRACKET) {
          return `)${operator}`;
        }
        if (a.type === ExpressionItemType.FUN) {
          return `${a.function?.name}(${a.function?.argumentList
            .map((arg) =>
              createApiNameVariableListStr(arg.variableItemList!, {
                ...expressionOption,
                leftJoinTtype: arg.ttype,
                leftJoinField: { ttype: arg.ttype } as any
              })
            )
            .join(', ')})${operator}`;
        }
        return '';
      })
      .join(' ');
  });
}

export function createExpressionCommon(
  expressionItemList: IExpressionItem[],
  expressionOption: IExpressionOption,
  callback: Function
) {
  return callback(getValidExpressionItemList(expressionItemList, expressionOption), expressionOption);
}

export function getValidExpressionItemList(expressionItemList: IExpressionItem[], expressionOption: IExpressionOption) {
  if (!expressionItemList) {
    return [];
  }
  if (isExpressionItemListEmpty(expressionItemList, expressionOption)) {
    return [];
  }
  // 不要合并下面2行filter，会导致逻辑出错
  expressionItemList = expressionItemList.filter((a) => isValidExpressionItem(a, expressionOption));
  expressionItemList = expressionItemList.filter((a, index, arr) => {
    return checkExpressionItemBracket(a, index, expressionItemList);
  });

  return expressionItemList;
}

// 编辑态的有效行
function getEditValidExpressionItemList(expressionItemList: IExpressionItem[], expressionOption: IExpressionOption) {
  if (!expressionItemList) {
    return [];
  }
  // 不要合并下面2行filter，会导致逻辑出错
  expressionItemList = expressionItemList.filter((a) => a.checked);
  expressionItemList = expressionItemList.filter((a, index) => {
    return checkExpressionItemBracket(a, index, expressionItemList);
  });

  return expressionItemList;
}

function checkExpressionItemBracket(a: IExpressionItem, index: number, expressionItemList: IExpressionItem[]) {
  const prevRow = expressionItemList[index - 1];
  const nextRow = expressionItemList[index + 1];
  if (a.type === ExpressionItemType.LEFT_BRACKET && nextRow && nextRow.type === ExpressionItemType.RIGHT_BRACKET) {
    return false;
  }
  if (a.type === ExpressionItemType.RIGHT_BRACKET && prevRow && prevRow.type === ExpressionItemType.LEFT_BRACKET) {
    return false;
  }
  return true;
}

// 是否是有效行，选中且不存在为空的子参数为有效
export function isValidExpressionItem(expressionItem: IExpressionItem, expressionOption: IExpressionOption) {
  if (!expressionItem.checked) {
    return false;
  }
  if (isExpressionItemEmpty(expressionItem, expressionOption)) {
    return false;
  }
  return true;
}

/**
 * 默认会生成一行，但是该行无可用的参数，也按空行算
 * @param expressionItemList
 * @param expressionOption 表达式配置
 */
export function isExpressionItemListEmpty(expressionItemList: IExpressionItem[], expressionOption: IExpressionOption) {
  if (!expressionItemList || !expressionItemList.length) {
    return true;
  }
  if (expressionItemList.length === 1) {
    return isExpressionItemEmpty(expressionItemList[0], expressionOption);
  }
  return false;
}

function isExpressionItemEmpty(expressionItem: IExpressionItem, expressionOption: IExpressionOption) {
  if (!expressionItem) {
    return true;
  }
  if ([ExpressionItemType.LEFT_BRACKET, ExpressionItemType.RIGHT_BRACKET].includes(expressionItem.type)) {
    return false;
  }
  if (expressionItem.type === ExpressionItemType.FUN) {
    return isEmptyFunction(expressionItem);
  }
  if (isConditionExpression(expressionOption.type)) {
    return (
      !expressionItem.compareOperator ||
      isEmptyVariable(expressionItem.valueList!) ||
      (!isNoCompareExpOperator(expressionItem.compareOperator, expressionOption) &&
        isEmptyVariable(expressionItem.compareValueList!))
      // (isEmptyVariable(expressionItem.valueList!) && isEmptyVariable(expressionItem.compareValueList!))
    );
  }
  return isEmptyVariable(expressionItem.valueList!);
}

export function isConditionExpression(type: ExpressionDefinitionType) {
  return (
    type &&
    [ExpressionDefinitionType.RSQL_CONDITION, ExpressionDefinitionType.BOOLEAN_CONDITION]
      .map((a) => a.toString())
      .includes(type.toString())
  );
}

function isEmptyFunction(expressionItem: IExpressionItem) {
  if (!expressionItem || !expressionItem.function || !expressionItem.value) {
    return true;
  }
  if (
    !expressionItem.function.argumentList ||
    expressionItem.function.argumentList.findIndex((a) => isEmptyVariable(a.variableItemList!)) > -1
  ) {
    return true;
  }
  return false;
}

/**
 * 后端表达式对象 转成 前端表达式对象
 * @param expressionDefinition
 * @param expressionOption
 */
export function createExpressionItemByExpressionDefinition(
  expressionDefinition: IExpressionDefinition,
  expressionOption: IExpressionOption
): IExpressionDefinition {
  if (!expressionDefinition) {
    return expressionDefinition;
  }
  // console.log('createExpressionItemByExpressionDefinition', expressionDefinition);
  try {
    if (expressionOption.variableMaxStringLength) {
      expressionOption.variableMaxStringLength = VARIABLE_MAX_STRING_LENGTH;
    }
    const expressionOptionType = expressionOption.type;
    const isCondition = expressionOptionType !== ExpressionDefinitionType.OPERATION;
    const itemList: IExpressionItem[] = [];
    expressionDefinition.rowList.forEach((row, index) => {
      let item = { expCode: createVariableItemCode() } as IExpressionItem;
      const nextRow = expressionDefinition.rowList[index + 1];
      if (row.connector && row.connector.original) {
        item.operator = row.connector.original;
        if (!isCondition) {
          item.operatorOptions = getExpressionOperatorOptions();
        }
        const isLast = expressionDefinition.rowList.length === index + 1;
        const nextIsRightBracket = nextRow && nextRow.rowType === ExpressionItemType.RIGHT_BRACKET;
        item.showOperator = !(isLast || nextIsRightBracket);
      } else {
        item.showOperator = false;
      }

      if (row.rowType === ExpressionItemType.LEFT_BRACKET) {
        itemList.push({
          ...createDefaultExpressionLeftBracket(expressionOptionType),
          ...item
        } as IExpressionItem);
      } else if (row.rowType === ExpressionItemType.RIGHT_BRACKET) {
        itemList.push({
          ...createDefaultExpressionRightBracket(expressionOptionType),
          ...item
        } as IExpressionItem);
      } else if (row.rowType === ExpressionItemType.MIX || row.rowType === ExpressionItemType.VARIABLE) {
        item = {
          ...createDefaultExpressionItem(expressionOptionType),
          ...item,
          value: row.original,
          valueApiName: row.original,
          valueDisplayName: row.translation,
          valueList: undefined
        };
        row.blockList.forEach((block) => {
          if (block.blockType === ExpressionItemType.VARIABLE) {
            // valueList在前端的数据里排在compareValueList的前面，所以先判断处理valueList
            if (!item.valueList) {
              item.valueList = expressionCellList2variableItemList(block.cellList, isCondition, expressionOption);
            } else if (item.valueList) {
              item.compareValueList = expressionCellList2variableItemList(block.cellList, false, expressionOption);
              if (item.valueList && item.valueList.length) {
                const isRsqlCondition = expressionOptionType === ExpressionDefinitionType.RSQL_CONDITION;
                let variableItemType = isRsqlCondition
                  ? item.compareValueList && item.compareValueList?.[0]?.type
                  : undefined;
                if (isRsqlCondition && variableItemType === VariableItemType.OPTION) {
                  // variableItemType = VariableItemType.FIELD;
                }
                item.compareOperatorOptions = getDefaultCompareOperatorOptions(
                  expressionOptionType,
                  item.valueList[0],
                  variableItemType!
                );
              }
            }
          } else if (block.blockType === ExpressionItemType.CONNECTOR) {
            if (isCondition) {
              item.compareOperator = block.original;
            }
          }
        });
        if (!isCondition) {
          const validList = item.valueList?.filter((a) => !isEmptyObject(a.value));
          if (validList && validList.length === 1) {
            item.operatorOptions = getExpressionOperatorOptions({
              ttype: validList?.[0]?.ttype!
            } as unknown as IVariableItem);
          }
        }
        itemList.push(item);
      } else if (row.rowType === ExpressionItemType.FUN) {
        item.checked = true;
        item.type = ExpressionItemType.FUN;
        item.function = createExpressionFunction(row, expressionOption);
        item.value = item.function.name;
        item.valueApiName = row.original;
        item.valueDisplayName = row.translation;
        if (!isCondition) {
          item.operatorOptions = getExpressionOperatorOptions({
            ttype: item?.function?.returnType?.ttype!
          } as unknown as IVariableItem);
        }
        itemList.push(item);
      }
    });
    expressionDefinition.itemList = itemList;
  } catch (e) {
    console.warn('e', e, expressionDefinition, expressionOption);
  }
  return expressionDefinition;
}

function createExpressionFunction(row: IExpressionRow, expressionOption): IFunction {
  const funBlock = row.blockList[0];
  const fun = {
    name: funBlock.fun.original,
    displayName: funBlock.fun.translation,
    argumentList: funBlock.funArgList.map((arg) => {
      return {
        name: arg.original,
        displayName: arg.translation,
        ttype: arg.ttype,
        variableItemList: expressionCellList2variableItemList(arg.cellList, false, expressionOption)
      } as IFunctionArgument;
    })
  } as IFunction;
  queryExpBuildInFunction().then((funList) => {
    const find = funList.find((a) => a.name === fun.name);
    if (find) {
      fun.returnType = find.returnType;
      find.argumentList?.forEach((a, index) => {
        fun.argumentList[index] = { ...fun.argumentList[index], ...a };
      });
    }
  });

  return fun;
}

/**
 * 前端表达式对象 转换成 后端表达式对象
 * @param submitExpressionParam
 * @param expressionItemList
 * @param expressionOption
 */
export function createExpressionDefinitionByExpressionItem(
  submitExpressionParam: IQueryExpressionParam,
  expressionItemList: IExpressionItem[],
  expressionOption: IExpressionOption
): IExpressionDefinition | null {
  const { model, field, key } = submitExpressionParam || {};
  if (!model || !field || !key) {
    return null;
  }
  const expressionDefinition = {
    model,
    field,
    key,
    expressionType: expressionOption.type
  } as IExpressionDefinition;
  if (!expressionItemList) {
    return expressionDefinition;
  }
  try {
    const isCondition = expressionOption.type !== ExpressionDefinitionType.OPERATION;
    expressionDefinition.expressionDisplay = {
      original: isCondition
        ? createConditionExpressionApiName(expressionItemList, expressionOption)
        : createExpressionApiName(expressionItemList, expressionOption),
      translation: isCondition
        ? createConditionExpressionDisplayName(expressionItemList, expressionOption)
        : createExpressionDisplayName(expressionItemList, expressionOption)
    } as IExpressionDisplay;

    const rowList: IExpressionRow[] = [];
    expressionItemList
      .filter((a) => a.checked)
      .forEach((item) => {
        const blockList: IExpressionBlock[] = [];
        const row = {
          rowType: item.type,
          blockList
        } as IExpressionRow;
        if (item.showOperator) {
          row.connector = {
            original: item.operator,
            translation: translateOperator(item.operator!, expressionOption)
          } as IExpressionCell;
        }
        if (item.type === ExpressionItemType.LEFT_BRACKET || item.type === ExpressionItemType.RIGHT_BRACKET) {
        } else if (item.type === ExpressionItemType.VARIABLE) {
          blockList.push({
            blockType: ExpressionItemType.VARIABLE,
            cellList: variableItemList2expressionCellList(item.valueList!)
          } as IExpressionBlock);
          if (ExpressionDefinitionType.OPERATION !== expressionOption.type) {
            blockList.push({
              blockType: ExpressionItemType.CONNECTOR,
              original: item.compareOperator,
              translation: translateCompareOperatorDisplayName(
                item.compareOperator!,
                item.compareOperatorOptions,
                expressionOption
              )
            } as IExpressionBlock);
            blockList.push({
              blockType: ExpressionItemType.VARIABLE,
              cellList: variableItemList2expressionCellList(item.compareValueList!)
            } as IExpressionBlock);
          }
        } else if (item.type === ExpressionItemType.FUN) {
          blockList.push(createExpressionFunBlock(item));
        }
        rowList.push(row);
      });
    expressionDefinition.rowList = rowList;
    // console.log('expressionDefinition.2', expressionDefinition);
  } catch (e) {
    console.warn(e, arguments);
  }
  return expressionDefinition;
}

export function translateOperator(operator: string, expressionOption: IExpressionOption) {
  const trans = ExpressionOperatorConfig.find((a) => a.value === operator);
  if (trans) {
    return translateExpValue(trans.label);
  }
  const compareTrans = (
    expressionOption.type === ExpressionDefinitionType.RSQL_CONDITION
      ? ExpressionRsqlLogicOperatorList
      : ExpressionBooleanLogicOperatorList
  ).find((a) => a.value === operator);
  return compareTrans ? translateExpValue(compareTrans.label) : '';
}

export function translateCompareOperatorDisplayName(
  operator: string,
  operatorList: IExpSelectOption[] | undefined = undefined,
  expressionOption
) {
  if (expressionOption.type === ExpressionDefinitionType.OPERATION) {
    return '';
  }
  const compareTrans = (
    operatorList ||
    (expressionOption.type === ExpressionDefinitionType.RSQL_CONDITION
      ? ExpressionRsqlCompareOperatorList
      : BooleanExpressionCompareOperatorList)
  ).find((a) => a.value === operator);
  return compareTrans ? translateExpValue(compareTrans.label) : '';
}

function translateCompareOperatorValue(
  operator: string,
  operatorList: IExpSelectOption[] | undefined = undefined,
  expressionOption
) {
  if (expressionOption.type === ExpressionDefinitionType.OPERATION) {
    return '';
  }
  const compareTrans = (
    operatorList ||
    (expressionOption.type === ExpressionDefinitionType.RSQL_CONDITION
      ? ExpressionRsqlCompareOperatorList
      : BooleanExpressionCompareOperatorList)
  ).find((a) => a.value === operator);
  return compareTrans ? compareTrans.value : '';
}

function createExpressionFunBlock(item: IExpressionItem): IExpressionBlock {
  const funBlock = {
    blockType: ExpressionItemType.FUN
  } as IExpressionBlock;
  funBlock.fun = {
    original: item.function?.name,
    translation: item.function?.displayName
  } as IExpressionCell;
  funBlock.funArgList = !item.function?.argumentList
    ? []
    : item.function?.argumentList.map((arg) => {
        return {
          blockType: ExpressionItemType.VARIABLE,
          cellList: variableItemList2expressionCellList(arg.variableItemList!)
        } as IExpressionBlock;
      });
  return funBlock;
}

/**
 * 计算括号的缩进层级深度
 * @param expressionItems
 * @param currentBracketDeep
 * @param parentLevelId
 */
export function autoSetBracketDeep(expressionItems: IExpressionItem[], currentBracketDeep = 0, parentLevelId = 0) {
  if (!expressionItems) {
    return;
  }
  expressionItems.forEach((a) => {
    if (!a.expCode) {
      a.expCode = createVariableItemCode();
    }
  });
  autoSetBracketDeepInner(expressionItems, currentBracketDeep, parentLevelId);
}

function autoSetBracketDeepInner(expressionItems: IExpressionItem[], currentBracketDeep = 0, parentLevelId = 0) {
  // 遇到左括号的时候，会一次性把左右括号内的元素都处理掉，所以比右括号索引小的就不需要再处理了
  let processedIndex = -1;
  for (let i = 0; i < expressionItems.length; i++) {
    // console.log('processedIndex', processedIndex, i);
    if (i <= processedIndex) {
      continue;
    }
    const expressionItem = expressionItems[i];

    // const levelId = new Date().getTime() + randomNum(1000, 9999);
    const levelId = randomNum(1000, 9999);
    expressionItem.bracketDeep = currentBracketDeep;
    expressionItem.levelId = levelId;
    expressionItem.parentLevelId = parentLevelId;
    if (expressionItem.type === ExpressionItemType.LEFT_BRACKET) {
      // 该列表包含了当前的左括号元素在内
      const newExpressionItems = expressionItems.slice(i);
      // 1.从i开始向后找到的第一个右括号的索引为 firstRightBracketPosition
      const firstRightBracketPosition = newExpressionItems.findIndex(
        (a) => a.type === ExpressionItemType.RIGHT_BRACKET
      );
      if (firstRightBracketPosition === -1) {
        // console.log('firstRightBracketPosition not fund', i, expressionItems, newExpressionItems);
        continue;
      }
      // 2.当前左括号和第一个右括号间共有 leftBracketNum 个左括号(包含当前做括号在内)
      const leftBracketNum = newExpressionItems
        .slice(0, firstRightBracketPosition)
        .filter((a) => a.type === ExpressionItemType.LEFT_BRACKET).length;
      if (leftBracketNum === 1) {
        const rightBracketItem = newExpressionItems[firstRightBracketPosition];
        rightBracketItem.bracketDeep = expressionItem.bracketDeep;
        rightBracketItem.levelId = expressionItem.levelId;
        rightBracketItem.parentLevelId = expressionItem.parentLevelId;
        processedIndex = i + firstRightBracketPosition;
        // console.log('rightBracketItem.11111', rightBracketItem, i, firstRightBracketPosition, processedIndex);
        const childExpressionItems = newExpressionItems.slice(1, firstRightBracketPosition);
        autoSetBracketDeepInner(childExpressionItems, currentBracketDeep + 1, levelId);
        continue;
      }
      // 3.从newExpressionItems 的 firstRightBracketPosition 后找到的第 leftBracketNum 个元素就是当前左括号配对的右括号
      const findRightList = newExpressionItems.slice(firstRightBracketPosition);
      let matchedRightBracketItemNum = 0;
      for (let j = 0; j < findRightList.length; j++) {
        const item = findRightList[j];
        if (item.type === ExpressionItemType.RIGHT_BRACKET) {
          matchedRightBracketItemNum++;
          if (matchedRightBracketItemNum === leftBracketNum) {
            item.bracketDeep = expressionItem.bracketDeep;
            item.levelId = expressionItem.levelId;
            item.parentLevelId = expressionItem.parentLevelId;
            processedIndex = i + firstRightBracketPosition + j;
            const childExpressionItems = newExpressionItems.slice(1, firstRightBracketPosition + j);
            // console.log('findRightList.xxxxxxxxx', item, i, j, firstRightBracketPosition, processedIndex);
            autoSetBracketDeepInner(childExpressionItems, currentBracketDeep + 1, levelId);
            break;
          }
        }
      }
    }
  }
}

export function seniorMode2quickMode(expressionItemList: IExpressionItem[]) {
  expressionItemList = deepClone(expressionItemList);
  expressionItemList = expressionItemList.filter(
    (a) => a.checked && a.type != ExpressionItemType.LEFT_BRACKET && a.type != ExpressionItemType.RIGHT_BRACKET
  );
  expressionItemList.forEach((a, index) => {
    const isLast = index === expressionItemList.length - 1;
    if (!isLast && !a.showOperator) {
      a.showOperator = true;
    }
  });
  return expressionItemList;
}

export function quickMode2SeniorMode(expressionItemList: IExpressionItem[], contextItems: IVariableContextItem[]) {
  expressionItemList.forEach((a) => {
    a.showValueListLabel = true;
    a.showCompareValueListLabel = true;
    valueListChange(a.valueList!, a, contextItems);
    compareValueListChange(a.compareValueList!, a, contextItems);
    if (a.type === ExpressionItemType.FUN && a.function && a.function.argumentList) {
      a.function.argumentList.forEach((arg) => {
        arg.showValueListLabel = true;
        valueListChange(arg.variableItemList!, arg, contextItems);
      });
    }
  });
  autoSetBracketDeep(expressionItemList);
  return expressionItemList;
}

function valueListChange(
  valueList: IVariableItem[],
  expressionItem: IExpressionItem | IFunctionArgument,
  contextItems: IVariableContextItem[]
) {
  expressionItem.valueListDisplayName = createDisplayNameVariableListStr(valueList!, {
    variableContextItems: contextItems,
    isBetweenInBrackets: true,
    quoteType: IExpressionQuoteType.SINGLE
  } as IExpressionOption);
  expressionItem.valueListApiName = createApiNameVariableListStr(valueList!, {
    variableContextItems: contextItems,
    isBetweenInBrackets: true,
    quoteType: IExpressionQuoteType.SINGLE
  } as IExpressionOption);
  // console.log('valueListChange', expressionItem);
  if ('type' in expressionItem) {
    (expressionItem as IExpressionItem).isEmptyRow = isEmptyRow(expressionItem as IExpressionItem);
  }
}

function compareValueListChange(
  valueList: IVariableItem[],
  expressionItem: IExpressionItem,
  contextItems: IVariableContextItem[]
) {
  expressionItem.compareValueListDisplayName = createDisplayNameVariableListStr(valueList!, {
    variableContextItems: contextItems,
    isBetweenInBrackets: true,
    quoteType: IExpressionQuoteType.SINGLE
  } as IExpressionOption);
  expressionItem.compareValueListApiName = createApiNameVariableListStr(valueList!, {
    variableContextItems: contextItems,
    isBetweenInBrackets: true,
    quoteType: IExpressionQuoteType.SINGLE
  } as IExpressionOption);
  expressionItem.isEmptyRow = isEmptyRow(expressionItem);
}

export function isEmptyRow(expressionItem: IExpressionItem) {
  return (
    !expressionItem.valueListApiName &&
    !expressionItem.valueListDisplayName &&
    !expressionItem.compareValueListApiName &&
    !expressionItem.compareValueListDisplayName
  );
}

// 括号的选中状态需要同步匹配的另外一个括号
export function changeBracketCheckStatus(
  index: number,
  expressionItemList: IExpressionItem[],
  expressionOption: IExpressionOption
) {
  const expressionItem = expressionItemList[index];
  if (expressionItem.type === ExpressionItemType.LEFT_BRACKET) {
    const rightBracketIndex = expressionItemList.findIndex(
      (a) => a.type === ExpressionItemType.RIGHT_BRACKET && a.levelId === expressionItem.levelId
    );
    if (rightBracketIndex > -1) {
      // 同步右括号的选中状态
      expressionItemList[rightBracketIndex].checked = expressionItem.checked;
      const bracketInnerRows = rightBracketIndex - index;
      if (bracketInnerRows > 1) {
        // 一对括号中间还有其他类型表达式行,也要同步选中状态
        for (let i = 1; i < bracketInnerRows; i++) {
          const row = expressionItemList[rightBracketIndex - i];
          if (row.checked != expressionItem.checked) {
            // 只修改状态不一致的，减少watch的触发次数
            row.checked = expressionItem.checked;
          }
        }
      }
    }
  }
  recalculateShowOperator(expressionItemList, expressionOption);
}

/**
 * 重新计算行尾的连接符
 * @param expressionItemList
 * @param expressionOption
 */
export async function recalculateShowOperator(
  expressionItemList: IExpressionItem[],
  expressionOption: IExpressionOption
) {
  await nextTick();
  const validList = getEditValidExpressionItemList(expressionItemList, expressionOption);
  const { length } = validList;
  for (let i = 0; i < length; i++) {
    const currentItem = validList[i];
    const nextItem = validList[i + 1];
    const isLast = length === i + 1;
    const nextIsRightBracket = nextItem && nextItem.type === ExpressionItemType.RIGHT_BRACKET;
    const realCurrent = expressionItemList.find((a) => a.expCode === currentItem.expCode);
    if (realCurrent) {
      const showOperator = !(isLast || nextIsRightBracket) && realCurrent.type !== ExpressionItemType.LEFT_BRACKET;
      if (realCurrent.showOperator !== showOperator) {
        realCurrent.showOperator = showOperator;
      }
    }
  }
}
