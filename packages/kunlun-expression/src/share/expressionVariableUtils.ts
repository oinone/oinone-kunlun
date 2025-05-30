import { Pagination, translateValueByKey } from '@kunlun/engine';
import { ExpressionKeyword } from '@kunlun/expression';
import {
  IModelField,
  isComplexTtype,
  isDateTtype,
  isNumberTtype,
  isRelationTtype,
  ModelFieldSerializeType,
  ModelFieldType
} from '@kunlun/meta';
import { Condition } from '@kunlun/request';
import { IQueryPageResult } from '@kunlun/service';
import { OioNotification, StringHelper } from '@kunlun/vue-ui-antd';
import { toString } from 'lodash-es';
import { queryExpModelFields, queryExpModelPage } from '../service';
import {
  ExpressionDefinitionType,
  ExpressionItemType,
  ExpressionKeywordDisplayName,
  ExpressionSeniorMode,
  IExpModel,
  IExpressionCell,
  IExpressionOption,
  IExpressionQuoteType,
  IExpSelectOption,
  IFunFilterMethod,
  IVariableContextItem,
  IVariableItem,
  JavaDateTimeFormatEnum,
  ModelOptionType,
  STR_TO_DATE_FUN,
  VARIABLE_MAX_STRING_LENGTH,
  VARIABLE_SEPARATE,
  VariableItemType
} from '../types';
import { isModelOrField, isSingleComplexField, translateExpValue } from './utils';

export function getSelectedFields(varList: IVariableItem[]) {
  return varList
    .filter((a) => a.type === VariableItemType.VARIABLE)
    .map((a) => {
      return a.value.includes(VARIABLE_SEPARATE) ? a.value.split(VARIABLE_SEPARATE)[1] : a.value;
    });
}

/**
 * 创建表达式的上下文元素
 * @param contextItems
 * @param modelModel baseModel.model
 * @param fieldModel baseField.model 字段的模型编码或者自定义的模型编码
 */
export function createContextItems(
  contextItems: IVariableContextItem[] | string,
  modelModel: string,
  fieldModel: string
): IVariableContextItem[] {
  if (contextItems) {
    if (contextItems instanceof String) {
      return JSON.parse(contextItems as string) as IVariableContextItem[];
    }
    return contextItems as IVariableContextItem[];
  }
  return [
    {
      name: ExpressionKeyword.activeRecord,
      displayName: translateExpValue(ExpressionKeywordDisplayName[ExpressionKeyword.activeRecord]),
      // 编辑BaseModel和BaseField的时候需要转成BaseMode.model
      models: [isModelOrField(fieldModel) ? modelModel : fieldModel]
    }
  ] as IVariableContextItem[];
}

export function createDefaultVariableItemList() {
  return [createBlankStringVariableItem()] as IVariableItem[];
}

// 前端在变量尾部需要空的可输入字符串Input效果
export function createBlankStringVariableItem() {
  return { varCode: createVariableItemCode(), type: VariableItemType.STRING, value: '' } as IVariableItem;
}

export function isDefaultBlankStringVariableItemList(variableList: IVariableItem[] | undefined) {
  if (variableList && variableList.length === 1) {
    const variableItem = variableList[0];
    return (
      variableItem &&
      Object.keys(variableItem).length === 3 &&
      !!variableItem.varCode &&
      variableItem.type === VariableItemType.STRING &&
      variableItem.value === ''
    );
  }
  return false;
}

// 创建变量类型变量元素
export function createDefaultVariableItem() {
  return {
    varCode: createVariableItemCode(),
    type: VariableItemType.VARIABLE,
    value: ''
  } as IVariableItem;
}

// 创建字段类型变量元素
export function createDefaultFieldItem() {
  return {
    varCode: createVariableItemCode(),
    type: VariableItemType.FIELD,
    value: ''
  } as IVariableItem;
}

// 创建枚举类型变量元素
function createDefaultOptionItem() {
  return {
    varCode: createVariableItemCode(),
    type: VariableItemType.OPTION,
    value: ''
  } as IVariableItem;
}

// 创建session上下文类型变量元素
export function createDefaultSessionItem() {
  return {
    varCode: createVariableItemCode(),
    type: VariableItemType.SESSION,
    value: ''
  } as IVariableItem;
}

// 实际存储的值
export function createValueVariableListStr(
  variableItemList: IVariableItem[],
  expressionOption: IExpressionOption,
  leftVariableItem: IVariableItem | undefined = undefined
  // variableContextItems: IVariableContextItem[],
  // isBetweenInBrackets = true,
  // isAddQuote = true
) {
  return createVariableListStr(
    ExpressionSeniorMode.VALUE,
    leftVariableItem,
    variableItemList,
    expressionOption,
    (item: IVariableItem) => {
      if (
        [ExpressionDefinitionType.BOOLEAN_CONDITION].includes(expressionOption.type) &&
        leftVariableItem &&
        leftVariableItem.ttype === ModelFieldType.Enum &&
        item.type === VariableItemType.OPTION
      ) {
        return autoAddQuote(item.value, expressionOption.quoteType);
      }
      if (
        expressionOption.type === ExpressionDefinitionType.OPERATION &&
        item.type === VariableItemType.VARIABLE &&
        expressionOption.variableCustomMethod
      ) {
        return expressionOption.variableCustomMethod(item.value);
      }
      return expressionOption.isRsqlLeft || item.type === VariableItemType.FIELD ? item.apiName : item.value;
    }
  );
}

// 英文的仅供展示的值
export function createApiNameVariableListStr(
  variableItemList: IVariableItem[],
  expressionOption: IExpressionOption,
  leftVariableItem: IVariableItem | undefined = undefined
  // variableContextItems: IVariableContextItem[],
  // isBetweenInBrackets = true,
  // isAddQuote = true
) {
  return createVariableListStr(
    ExpressionSeniorMode.API_NAME,
    leftVariableItem,
    variableItemList,
    expressionOption,
    (item: IVariableItem) => {
      let apiName = item.apiName;
      if (item.apiName?.startsWith(ExpressionKeyword.activeRecord + VARIABLE_SEPARATE)) {
        // 在api中只有activeRecord不展示
        apiName = apiName?.substring(ExpressionKeyword.activeRecord.length + 1);
      }
      return apiName;
    }
  );
}

// 中文的仅供展示的值
export function createDisplayNameVariableListStr(
  variableItemList: IVariableItem[],
  expressionOption: IExpressionOption,
  leftVariableItem: IVariableItem | undefined = undefined
  // variableContextItems: IVariableContextItem[],
  // isBetweenInBrackets = true,
  // isAddQuote = true
) {
  return createVariableListStr(
    ExpressionSeniorMode.DISPLAY_NAME,
    leftVariableItem,
    variableItemList,
    expressionOption,
    (item: IVariableItem) => {
      const list = [item.displayName];
      if (!item.value?.startsWith(ExpressionKeyword.activeRecord + VARIABLE_SEPARATE)) {
        // 在value中只有activeRecord对应的displayName不展示
        // console.warn('createDisplayNameVariableListStr', item.value, item);
        // TODO 暂时关闭该功能
        // list.unshift(getContextItemDisplayName(variableContextItems, item.value.split(VARIABLE_SEPARATE)![0]));
      }
      item.subTitle && list.push(item.subTitle);
      return list.join(VARIABLE_SEPARATE);
    }
  );
}

/**
 *
 * @param expressionSeniorMode
 * @param leftVariableItem
 * @param variableItemList
 * @param expressionOption
 * @param processFunc
 */
function createVariableListStr(
  expressionSeniorMode: ExpressionSeniorMode,
  leftVariableItem: IVariableItem | undefined = undefined,
  variableItemList: IVariableItem[],
  expressionOption: IExpressionOption,
  processFunc: Function
) {
  if (!variableItemList) {
    return '';
  }
  const list = variableItemList
    .filter((a) => !(a.type === VariableItemType.STRING && !a.value))
    .map((a) => {
      if (a.type === VariableItemType.STRING) {
        if (a.value || variableItemList.length === 1) {
          if (expressionOption.leftJoinTtype) {
            if (isNumberTtype(expressionOption.leftJoinTtype)) {
              return a.value;
            }
            if (
              expressionSeniorMode == ExpressionSeniorMode.VALUE &&
              expressionOption.type === ExpressionDefinitionType.OPERATION &&
              expressionOption.leftJoinTtype === ModelFieldType.Boolean
            ) {
              // 支持布尔类型的参数可以直接写表达式
              return a.value;
            }
            if (expressionOption.leftJoinTtype === ModelFieldType.OBJ && isKeywordValue(a.value)) {
              return a.value;
            }
          }
          if (
            (!leftVariableItem || isStringTtype(leftVariableItem.ttype) || isDateTtype(leftVariableItem.ttype)) &&
            expressionSeniorMode != ExpressionSeniorMode.DISPLAY_NAME
          ) {
            let right = autoAddQuote(a.value, expressionOption.quoteType);
            if (
              [ExpressionDefinitionType.BOOLEAN_CONDITION, ExpressionDefinitionType.OPERATION].includes(
                expressionOption.type
              ) &&
              leftVariableItem &&
              isDateTtype(leftVariableItem.ttype) &&
              !expressionOption.isFrontend
            ) {
              const dateFormat = JavaDateTimeFormatEnum[leftVariableItem.ttype];
              right = `${STR_TO_DATE_FUN}(${right}, '${dateFormat}')`;
            }
            return right;
          }
          if (
            expressionSeniorMode == ExpressionSeniorMode.VALUE &&
            expressionOption.type === ExpressionDefinitionType.BOOLEAN_CONDITION &&
            leftVariableItem &&
            isNumberTtype(leftVariableItem.ttype) &&
            expressionOption.numberCustomMethod &&
            a.type === VariableItemType.STRING
          ) {
            return expressionOption.numberCustomMethod(a.value, leftVariableItem.ttype);
          }
          return a.value;
        } else {
          return '';
        }
      } else {
        return processFunc(a);
      }
    });
  // 单个变量下多余2个值就需要用 "+" 连接,且用括号包裹
  return expressionOption.isBetweenInBrackets && list.length > 1 ? `(${list.join(' + ')})` : list.join(' + ');
}

function isKeywordValue(value: string): boolean {
  if (['null'].includes(value)) {
    return true;
  }
  if (
    [ExpressionKeyword.activeRecord, ExpressionKeyword.rootRecord, ExpressionKeyword.openerRecord].some((v) =>
      value.includes(v)
    )
  ) {
    return true;
  }
  return false;
}

// 字符串包裹的引号类型
export function autoAddQuote(str: string, quoteType: IExpressionQuoteType) {
  if (quoteType === IExpressionQuoteType.SINGLE) {
    return `'${str}'`;
  } else if (quoteType === IExpressionQuoteType.DOUBLE) {
    return `"${str}"`;
  }
  return str;
}

function getContextItemName(variableContextItems: IVariableContextItem[], currentContextName = '') {
  const contextItem = getContextItem(variableContextItems, currentContextName);
  return contextItem ? contextItem.name : ExpressionKeyword.activeRecord;
}

function getContextItemDisplayName(variableContextItems: IVariableContextItem[], currentContextName = '') {
  const contextItem = getContextItem(variableContextItems, currentContextName);
  return contextItem ? contextItem.displayName : translateExpValue(ExpressionKeywordDisplayName.activeRecord);
}

function getContextItem(variableContextItems: IVariableContextItem[], currentContextName: string) {
  if (!variableContextItems) {
    return null;
  }
  const find = variableContextItems.find((a) => a.name === currentContextName);
  return find ? find : variableContextItems[0];
}

/**
 * 变量为了保证行尾可以输字符串,所以行尾始终会自动加一个为空的字符串Input,实际按空算
 * @param valueList
 */
export function isEmptyVariable(valueList: IVariableItem[]) {
  if (!valueList?.length) {
    return true;
  }
  if (valueList.length === 1) {
    return !valueList[0].value;
    // return valueList[0].type === VariableItemType.STRING && !valueList[0].value;
  }
  return false;
}

export function getValidVariableItemList(variableItems: IVariableItem[]): IVariableItem[] {
  return variableItems ? variableItems.filter((a) => a.value) : ([] as IVariableItem[]);
}

/**
 * 最后一个非字符串参数已自动加空字符串在行尾
 * @param variableItemList
 */
export function autoAppendBlankStrVariableItem(variableItemList: IVariableItem[]) {
  if (
    variableItemList.length === 0 ||
    (variableItemList.length > 0 && variableItemList[variableItemList.length - 1].type === VariableItemType.VARIABLE)
  ) {
    variableItemList.push(createBlankStringVariableItem());
  }
}

/**
 * 变量之间加空白字符串，变量在头需要在变量前加空字符串，变量在尾需要在变量后加字符串
 * @param variableItemList
 */
export function autoAddStrVariableItemBetweenVariables(variableItemList: IVariableItem[]) {
  const varList = variableItemList.filter((a) => a.type === VariableItemType.VARIABLE);
  varList.forEach((a) => {
    const varIndex = variableItemList.findIndex((b) => b.varCode === a.varCode);
    if (varIndex >= 0) {
      if (varIndex === 0) {
        variableItemList.unshift(createBlankStringVariableItem());
      } else {
        if (varIndex === variableItemList.length - 1) {
          // 最后一个非字符串参数已自动加过空字符串在行尾了，这里不用处理
        } else {
          const nextVar = variableItemList[varIndex + 1];
          if (nextVar.type === VariableItemType.VARIABLE) {
            // 如果下一个是变量则在两者间加个空字符串
            // console.log('varIndex', varIndex, nextVar);
            variableItemList.splice(varIndex + 1, 0, createBlankStringVariableItem());
          }
        }
      }
    }
  });
}

/**
 * 合并相邻的字符串,保留前一个的索引位置
 * @param variableItemList
 * @param expressionOption
 */
export function mergeVariableItemsNearlyString(variableItemList: IVariableItem[], expressionOption: IExpressionOption) {
  const strList = variableItemList.filter((a) => a.type === VariableItemType.STRING);
  strList.forEach((a) => {
    const strIndex = variableItemList.findIndex((b) => b.varCode === a.varCode);
    if (strIndex >= 0) {
      if (strIndex === variableItemList.length - 1) {
        // 最后一个字符串参数不用
      } else {
        const nextStr = variableItemList[strIndex + 1];
        if (nextStr.type === VariableItemType.STRING) {
          // 将后面字符串的值加到第一个字符串
          let newValue = variableItemList[strIndex].value + nextStr.value;
          const maxLength =
            (expressionOption && expressionOption.variableMaxStringLength) || VARIABLE_MAX_STRING_LENGTH;
          variableItemList[strIndex].value = newValue.length > maxLength ? newValue.substring(0, maxLength) : newValue;
          variableItemList.splice(strIndex + 1, 1);
        }
      }
    }
  });
}

/**
 * 删除指定位置的变量
 * 删除变量后，如果相邻的两个参数都是字符串就需要合并2个字符串，保留前一个删除后一个
 * @param variableItemList
 * @param index
 * @param variableMaxStringLength
 */
export function removeVariableItemByIndex(
  variableItemList: IVariableItem[],
  index: number,
  variableMaxStringLength: number
) {
  variableItemList.splice(index, 1, ...(variableItemList.length === 1 ? createDefaultVariableItemList() : []));
  if (variableItemList.length > 1 && index != 0) {
    const current = variableItemList[index];
    const prev = variableItemList[index - 1];
    if (current.type === VariableItemType.STRING && prev.type === VariableItemType.STRING) {
      const newValue = prev.value + current.value;
      variableItemList[index - 1].value =
        newValue.length > variableMaxStringLength ? newValue.substring(0, variableMaxStringLength) : newValue;
      variableItemList.splice(index, 1);
    }
  }
}

export function createVariableItemCode() {
  return `${new Date().getTime()}${StringHelper.random(6)}`;
}

export function variableItem2expressionCell(variableItem: IVariableItem): IExpressionCell {
  const isVariable = [
    VariableItemType.VARIABLE,
    VariableItemType.OPTION,
    VariableItemType.FIELD,
    VariableItemType.SESSION
  ].includes(variableItem.type);
  const value = toString(variableItem.value);
  const transArr = [isVariable ? variableItem.displayName! : value] as string[];
  if (isVariable) {
    variableItem.subTitle && transArr.push(variableItem.subTitle);
  }
  return {
    cellType: isVariable ? variableItem.type.toUpperCase() : ExpressionItemType.CONSTANT,
    original: isVariable ? variableItem.apiName : value,
    translation: transArr.join(VARIABLE_SEPARATE),
    value: value,
    ttype: isVariable ? variableItem.ttype : ModelFieldType.String,
    multi: isVariable ? variableItem.multi : null,
    bitEnum: isVariable ? variableItem.bitEnum : null,
    store: isVariable ? variableItem.store : null
  } as IExpressionCell;
}

export function variableItemList2expressionCellList(variableItemList: IVariableItem[]): IExpressionCell[] {
  return variableItemList.map((item) => {
    return variableItem2expressionCell(item);
  });
}

export function expressionCell2variableItem(cell: IExpressionCell): IVariableItem {
  const isVariable = [
    ExpressionItemType.VARIABLE,
    ExpressionItemType.OPTION,
    ExpressionItemType.FIELD,
    ExpressionItemType.SESSION
  ].includes(cell.cellType);
  const transArr = cell.translation ? cell.translation.split(VARIABLE_SEPARATE) : [];
  const displayName = transArr.length >= 1 ? transArr.shift() : cell.translation;
  const subTitle = transArr.join(VARIABLE_SEPARATE);
  let original = cell.original || '';
  let value = cell.value || cell.original;
  if (original) {
    original = original.split(' + ')[0];
  }
  if (value) {
    value = value.split(' + ')[0];
  }
  return {
    varCode: createVariableItemCode(),
    type: cell.cellType === ExpressionItemType.CONSTANT ? VariableItemType.STRING : cell.cellType.toLowerCase(),
    apiName: original.startsWith(ExpressionKeyword.activeRecord)
      ? original.substring(ExpressionKeyword.activeRecord.length + 1)
      : original,
    displayName,
    subTitle,
    value,
    ttype: cell.cellType != ExpressionItemType.CONSTANT ? cell.ttype : ModelFieldType.String,
    multi: isVariable ? cell.multi : null,
    bitEnum: isVariable ? cell.bitEnum : null,
    store: isVariable ? cell.store : null
  } as IVariableItem;
}

export function expressionCellList2variableItemList(
  cellList: IExpressionCell[],
  isCondition = false,
  expressionOption: IExpressionOption
): IVariableItem[] {
  const list = cellList.map((cell) => {
    return expressionCell2variableItem(cell);
  });
  if (!isCondition) {
    autoAppendBlankStrVariableItem(list);
    autoAddStrVariableItemBetweenVariables(list);
    mergeVariableItemsNearlyString(list, expressionOption);
  }
  return list;
}

/**
 *
 * @param modelList
 * @param ttypes 支持的ttype
 * @param isFieldStore 是否只选择存储字段
 * @param isAllowComplexField 是否可选择复杂字段
 * @param isCondition 是否条件表达式
 * @param filterMethod 自定义过滤器，不覆盖已有的过滤条件
 */
export function convertModels2FieldSelectionOptions(
  modelList: IExpModel[],
  ttypes = [] as ModelFieldType[],
  isFieldStore: boolean | undefined = undefined,
  isAllowComplexField: boolean | undefined = undefined,
  isCondition = false,
  filterMethod: IFunFilterMethod | undefined = undefined
) {
  const options: IExpSelectOption[] = [];
  modelList?.forEach((model) => {
    let children: IExpSelectOption[] = [];
    if (model.modelFields) {
      children = convertModelFields2Options(
        model.modelFields!,
        ttypes,
        isFieldStore,
        isAllowComplexField,
        isCondition,
        filterMethod
      );
    }
    options.push({
      optionType: ModelOptionType.MODEL,
      ...model,
      optType: 'option',
      ttype: ModelFieldType.ManyToOne,
      value: model.model,
      label: model.displayName!,
      children,
      isChildrenLoaded: !!children.length
    });
  });
  return options;
}

export function convertModelFields2Options(
  modelFields: IModelField[],
  ttypes = [] as ModelFieldType[],
  isFieldStore: boolean | undefined = undefined,
  allowComplexField: boolean | undefined = undefined,
  isCondition = false,
  filterMethod: IFunFilterMethod | undefined = undefined
): IExpSelectOption[] {
  if (!modelFields) {
    return [] as IExpSelectOption[];
  }
  const options: IExpSelectOption[] = [];
  modelFields.forEach((field) => {
    // if ((field as any).show !== ExpActiveType.ACTIVE) {
    //   return false;
    // }
    if (field.ttype === ModelFieldType.Related && field.relatedTtype) {
      field.ttype = field.relatedTtype;
    }
    if (allowComplexField === false && isComplexTtype(field.ttype)) {
      return false;
    }
    if (isFieldStore && !field.store) {
      return false;
    }
    if (isFieldStore === false && field.store) {
      return false;
    }
    if ([ModelFieldType.OneToOne, ModelFieldType.ManyToOne].includes(field.ttype!)) {
      // 单体对象，如果他下面有符合条件的字段，那么该父字段也符合条件
      const children = convertModelFields2Options(
        field.modelFields,
        ttypes,
        isFieldStore,
        allowComplexField,
        isCondition,
        filterMethod
      );
      if (children.length) {
        options.push(createOption(field, children, isCondition));
        return true;
      }
    }
    if (ttypes && ttypes.length && !ttypes.includes(field.ttype)) {
      return false;
    }
    if (filterMethod && !filterMethod?.(field)) {
      return false;
    }

    const children = convertModelFields2Options(
      field.modelFields,
      ttypes,
      isFieldStore,
      allowComplexField,
      isCondition,
      filterMethod
    );
    options.push(createOption(field, children, isCondition));
    return true;
  });
  return options;
}

function createOption(field: IModelField, children: IExpSelectOption[], isCondition = false) {
  const model = field.model;
  const isObject =
    model || [ModelFieldType.ManyToOne, ModelFieldType.OneToOne].includes(field.ttype) || field.modelFields?.length;
  return {
    // FIXME 复杂字段的 optionType 需要用 ModelOptionType.MODEL?
    ...field,
    optionType: isObject ? ModelOptionType.MODEL : ModelOptionType.FIELD,
    ttype: isObject && !field.ttype ? (field.multi ? ModelFieldType.OneToMany : ModelFieldType.ManyToOne) : field.ttype,
    value: field.name,
    // label: field.displayName! + (isSingleComplexField(field.ttype) ? field.ttype : ''),
    label: field.displayName!,
    children,
    isChildrenLoaded: isCondition ? false : !!children.length || !isSingleComplexField(field.ttype)
  };
}

/**
 * 根据选择的字段拼接apiName value subTitle
 * @param options 提供的选项下拉 { IExpSelectOption & ModelField }
 * @param selectedValues 选中字段的所有层级，复杂字段才会有多层级
 * @param variableContextItem 使用的上下文
 * @param variableItemType 类型
 * @param ttypes 可用字段类型
 * @param useContextName 使用contextName拼接
 */
export function createVariableItemBySelectedOptions(
  options: IExpSelectOption[],
  selectedValues: string[],
  variableContextItem: IVariableContextItem,
  variableItemType?: VariableItemType,
  ttypes?: ModelFieldType[],
  useContextName?: boolean
): IVariableItem | null {
  if (!options || !options.length || !selectedValues || !selectedValues.length) {
    console.warn('args invalid', arguments);
    return null;
  }
  const firstValue = options.find((a) => a.value === selectedValues[0]);
  if (!firstValue) {
    console.warn('first selected value not fund', selectedValues);
    return null;
  }
  let variableItem;
  if (firstValue.ttype === ModelFieldType.Enum || variableItemType === VariableItemType.OPTION) {
    variableItem = {
      ...createDefaultOptionItem(),
      ...firstValue,
      bitEnum: firstValue.storeSerialize == ModelFieldSerializeType.BIT,
      apiName: firstValue.field || firstValue.name,
      value: firstValue.field || firstValue.name
    } as IVariableItem;
  } else if (variableItemType === VariableItemType.SESSION) {
    variableItem = {
      ...createDefaultSessionItem(),
      ...firstValue,
      apiName: firstValue.value,
      value: firstValue.value
    } as IVariableItem;
  } else {
    const topLevelIsModel = firstValue.optionType === ModelOptionType.MODEL;
    const isOnlyOneOptionsAndSimpleField = () => {
      return (
        options.length === 1 &&
        variableContextItem.name === firstValue.name &&
        (!variableContextItem.models?.length ||
          !variableContextItem.ttype ||
          ![ModelFieldType.ManyToOne, ModelFieldType.OneToOne].includes(
            variableContextItem.ttype as unknown as ModelFieldType
          ))
      );
    };
    const createVariableItemValue = () => {
      const strArr = [firstValue.field || firstValue.name] as string[];
      // FIXME 全部改用useContextName
      // 只有一个variableContextItem的时候可能不会把variableContextItem放到options内，这个时候如果需要拼variableContextItem.name就拿不到值，需要单独判断塞进去
      if (useContextName || !(topLevelIsModel || !variableContextItem || isOnlyOneOptionsAndSimpleField())) {
        if (
          variableContextItem &&
          variableContextItem.name &&
          variableContextItem.name !== strArr[0] &&
          variableContextItem.displayName !== firstValue.displayName
        ) {
          strArr.unshift(variableContextItem.name);
        }
      }
      return strArr.join(VARIABLE_SEPARATE);
    };
    variableItem = {
      ...(variableItemType === VariableItemType.FIELD ? createDefaultFieldItem() : createDefaultVariableItem()),
      ...firstValue,
      bitEnum: firstValue.storeSerialize == ModelFieldSerializeType.BIT,
      apiName: firstValue.field || firstValue.name,
      value: createVariableItemValue(),
      contextItemName: variableContextItem?.name
    } as IVariableItem;
  }

  // console.log('createVariableItemBySelectedOptions', selectedValues, firstValue, variableItem, variableContextItem);
  if (firstValue.ttype) {
    variableItem.ttype = firstValue.ttype;
  }
  if (firstValue.multi) {
    variableItem.multi = true;
  }

  if (selectedValues.length > 1) {
    createChildVariableItem(selectedValues, variableItem, 1, firstValue.children!);
  }
  if (ttypes?.length && !ttypes?.includes(variableItem.ttype)) {
    // 不符合的类型不能选择，防止多层嵌套的时候选中路径中间的复杂字段
    console.warn(`allow ttype is ${ttypes.join(',')}, current ttype is ${variableItem.ttype}`);
    OioNotification.warning(translateValueByKey('类型不匹配，无法选择'));
    return null;
  }
  return variableItem;
}

function createChildVariableItem(
  selectedValues: string[],
  variableItem: IVariableItem,
  level = 1,
  currentOptions: IExpSelectOption[]
) {
  const childValue = currentOptions?.find((a) => a.value === selectedValues[level]);
  if (childValue) {
    if (!variableItem.subTitle) {
      variableItem.subTitle = '';
    }
    variableItem.subTitle += (level === 1 ? '' : VARIABLE_SEPARATE) + childValue.displayName;
    variableItem.apiName += VARIABLE_SEPARATE + childValue.field;
    variableItem.value += VARIABLE_SEPARATE + childValue.field;
    // variableItem.displayName += VARIABLE_SEPARATE + secondValue.displayName;
    variableItem.field = childValue;
    if (childValue.ttype) {
      variableItem.ttype = childValue.ttype;
    }
    if (childValue.multi) {
      variableItem.multi = true;
    }
    if (childValue.storeSerialize == ModelFieldSerializeType.BIT) {
      variableItem.bitEnum = true;
    }
    if (childValue.references) {
      variableItem.references = childValue.references;
    }
    if (selectedValues.length > level + 1) {
      createChildVariableItem(selectedValues, variableItem, level + 1, childValue.children!);
    }
  }
}

export function createVariableContextItem(selectedValues: string[], contextItems: IVariableContextItem[]) {
  // TODO 暂未支持选择指定上下文属性
  if (!contextItems || (contextItems.length > 1 && (!selectedValues || !selectedValues.length))) {
    return { name: 'unknown', displayName: translateExpValue('未知') } as IVariableContextItem;
  }
  if (contextItems.length > 1) {
    return contextItems.find((a) => a.name === selectedValues[0])!;
  }
  return contextItems[0];
}

// 是否为用户手动输入的控件
export function isCustomInputWidget(ttype: string | ModelFieldType) {
  return (
    ttype &&
    (isStringTtype(ttype as ModelFieldType) ||
      // || [ModelFieldType.Enum, ModelFieldType.MultiEnum, ModelFieldType.Boolean].map((a) => a.toString()).includes(ttype.toString())
      isNumberTtype(ttype as ModelFieldType))
    // || isDateTtype(ttype as ModelFieldType)
  );
}

/**
 * 字符串类型的需要用引号包起来
 * FIXME 数字类型的也要去用引号包起来是因为前段不能识别大数，改成了把数字变成字符串识别，如果不加引号会导致前端表达式不能正常执行，但是加了又会导致后端表达式引擎不能正确执行
 * @param ttype
 */
function isStringTtype(ttype: string | ModelFieldType) {
  return (
    ttype &&
    [
      // ModelFieldType.ID,
      // ModelFieldType.UID,
      // ModelFieldType.Integer,
      // ModelFieldType.Long,
      ModelFieldType.String,
      ModelFieldType.Text,
      ModelFieldType.HTML,
      ModelFieldType.Phone,
      ModelFieldType.Email
    ]
      .map((a) => a.toString())
      .includes(ttype.toString())
  );
}

/**
 * 大数类型的前端需要用引号包起来
 * 数字类型的也要去用引号包起来是因为前段不能识别大数，改成了把数字变成字符串识别，如果不加引号会导致前端表达式不能正常执行，但是加了又会导致后端表达式引擎不能正确执行
 * @param ttype
 */
export function isNumStringTtype(ttype: string | ModelFieldType) {
  return (
    ttype &&
    [ModelFieldType.ID, ModelFieldType.UID, ModelFieldType.Integer, ModelFieldType.Long]
      .map((a) => a.toString())
      .includes(ttype.toString())
  );
}

export function createInputPatternByTtype(ttype) {
  if (ttype) {
    if (
      [ModelFieldType.ID, ModelFieldType.UID, ModelFieldType.Integer, ModelFieldType.Long]
        .map((a) => a.toString())
        .includes(ttype.toString())
    ) {
      return /-?[1-9]\d*|0|\${[^}]+}|\$\#{[^}]+}/;
    } else if ([ModelFieldType.Currency, ModelFieldType.Float].map((a) => a.toString()).includes(ttype.toString())) {
      return /-?[1-9]\d*\.\d*|-?0\.\d*[1-9]\d*|-?[1-9]\d*|0/;
    }
  }
  return /.*/;
}

export async function fetchModelData(
  models: string[],
  keyword: string,
  pagination: Pagination,
  isFetchModelFields = true
): Promise<IQueryPageResult<Record<string, unknown>>> {
  const responseFields = `id,code,model,displayName,name,summary`.split(',');
  // const currentModule = store.getItem('currentModule');

  models = models?.filter((model) => !!model);
  if (!models || !models.length) {
    return {} as IQueryPageResult<any>;
  }
  const condition = new Condition('model').in(models);
  if (keyword) {
    condition.and(new Condition(`displayName`).like(`%${keyword}%`));
  }

  return queryExpModelPage('queryPage', responseFields, condition.toString(), pagination, isFetchModelFields);
}

export async function fetchExpressionChildren(
  selectedOptions: IExpSelectOption[],
  options: IExpSelectOption[],
  props: {
    ttypes?: ModelFieldType[];
    isFieldStore?: boolean;
    filterMethod?: IFunFilterMethod;
    allowComplexField?: boolean;
    isRsqlField?: boolean;
  }
) {
  if (!selectedOptions?.length) {
    return;
  }

  for (const option of selectedOptions) {
    const model = option.references || option.model;
    if (!option.isChildrenLoaded && model) {
      const isReferences = !!option.references;
      let modelFields = await queryExpModelFields(model);

      // const secondFilterFields = [] as string[];
      // if (first.referenceFields && first.referenceFields.length) {
      //   secondFilterFields.push(...(first.referenceFields as []));
      // }
      // if (first.pk && first.pk.length) {
      //   secondFilterFields.push(...(first.pk as []));
      // }
      if (isReferences && props.isRsqlField) {
        // 关联关系模型只能选关系字段
        modelFields = modelFields.filter((a) => (option.referenceFields || []).includes(a.name));
      } else {
        if (props.allowComplexField === false) {
          modelFields = modelFields.filter((a) => !isRelationTtype(a.ttype) && !isRelationTtype(a.relatedTtype));
        }
      }

      option.children = convertModelFields2Options(
        modelFields,
        props.ttypes,
        props.isFieldStore,
        true,
        false,
        props.filterMethod
      );
      option.isChildrenLoaded = true;
    }
  }
}

export function contextItems2ModelSelection(contextItems: IVariableContextItem[], props: any): IExpSelectOption[] {
  return contextItems.map((a) => {
    const model = a.models && a.models[0];
    const children = convertModelFields2Options(
      a.modelFields!,
      props.ttypes,
      props.isFieldStore,
      props.isCanSelectComplexField,
      false,
      props.filterMethod
    );
    const isObject =
      model || [ModelFieldType.ManyToOne, ModelFieldType.OneToOne].includes(a.ttype!) || a.modelFields?.length;
    return {
      ...a,
      optionType: isObject ? ModelOptionType.MODEL : ModelOptionType.FIELD,
      ttype: isObject && !a.ttype ? (a.multi ? ModelFieldType.OneToMany : ModelFieldType.ManyToOne) : a.ttype,
      model,
      value: a.name,
      label: a.displayName!,
      children,
      isChildrenLoaded:
        !!children.length ||
        !(model && (!a.ttype || [ModelFieldType.ManyToOne, ModelFieldType.OneToOne].includes(a.ttype!)))
    } as IExpSelectOption;
  });
}
