import { Expression } from '@kunlun/expression';
import {
  ActionContextType,
  ActionElement,
  ApiElement,
  ContextElement,
  Entity,
  FieldElement,
  fieldElement2ModelField,
  IModel,
  IModelField,
  IServerAction,
  modelField2fieldElement,
  ModelFieldType
} from '@kunlun/meta';
import { useMatched } from '@kunlun/router';
import {
  customMutation,
  customQuery,
  customQueryPage,
  getModel,
  IQueryPageOption,
  IQueryPageResult,
  requestMutation
} from '@kunlun/service';
import { RuntimeServerAction } from '../runtime-metadata';

import { FORM_DATA } from '../typing';

const api2RequestParam = async (
  fieldElements: FieldElement[],
  modelModel: string,
  requestParam: Entity | Entity[],
  activeRecords: Entity[],
  rootRecord: Entity,
  scene: string,
  requestFields: IModelField[] = [] as IModelField[]
): Promise<Entity | Entity[]> => {
  if (!fieldElements || fieldElements.length === 0) {
    const model = await getModel(modelModel);
    fieldElements = model.modelFields.map((a) => modelField2fieldElement(a));
  }
  const param: Entity[] = Array.isArray(requestParam) ? requestParam : [requestParam];
  const resultParam: Entity[] = [] as Entity[];
  for (const index in param) {
    const item = param[index];
    const newItem = {} as Entity;
    for (const fieldNameIndex in fieldElements) {
      const fieldEle = fieldElements[fieldNameIndex];
      const fieldName = fieldEle.name!;
      let newVal = item[fieldName];
      let modelFiled = fieldElement2ModelField(fieldEle);
      if (!fieldEle.ttype || !fieldEle.references) {
        // eslint-disable-next-line no-await-in-loop
        const model = await getModel(modelModel);
        modelFiled = model.modelFields.find((a) => a.name === fieldName)!;
      }
      if (!modelFiled) {
        // eslint-disable-next-line no-continue
        continue;
      }

      requestFields.push(modelFiled);
      if (fieldEle) {
        if (modelFiled!.ttype === ModelFieldType.OneToOne || modelFiled!.ttype === ModelFieldType.ManyToOne) {
          let childSubmitFields = [] as IModelField[];
          if (!fieldEle.children || fieldEle.children.length === 0) {
            // 复杂对象内没有自定义取属性
            if (fieldEle.textContent) {
              newVal = parseData(fieldEle.textContent, activeRecords, rootRecord as Record<string, unknown>, scene);
            } else {
              newVal = activeRecords[0] && activeRecords[0][fieldEle.name!];
            }
            // eslint-disable-next-line no-await-in-loop
            const childModel = await getModel(modelFiled.references!);
            childSubmitFields = childModel.modelFields;
          } else {
            // TODO 递归
            // eslint-disable-next-line no-await-in-loop
            newVal = await api2RequestParam(
              fieldEle.children,
              modelFiled!.references!,
              requestParam,
              activeRecords,
              rootRecord,
              scene,
              childSubmitFields
            );
          }
          modelFiled.modelFields = childSubmitFields;
        } else if (modelFiled!.ttype === ModelFieldType.ManyToMany || modelFiled!.ttype === ModelFieldType.OneToMany) {
          if (newVal && Array.isArray(newVal) && newVal.length > 0) {
            let childSubmitFields = [] as IModelField[];
            if (!fieldEle.children || fieldEle.children.length === 0) {
              // 复杂对象内没有自定义取属性
              if (fieldEle.textContent) {
                newVal = parseData(fieldEle.textContent, activeRecords, rootRecord as Record<string, unknown>, scene);
              } else {
                newVal = activeRecords[0] && activeRecords[0][fieldEle.name!];
              }
              // eslint-disable-next-line no-await-in-loop
              const childModel = await getModel(modelFiled.references!);
              childSubmitFields = childModel.modelFields;
            } else {
              // eslint-disable-next-line no-await-in-loop
              newVal = await api2RequestParam(
                fieldEle.children,
                modelFiled!.references!,
                newVal,
                activeRecords,
                rootRecord,
                scene,
                childSubmitFields
              );
            }
            modelFiled.modelFields = childSubmitFields;
          }
        } else if (fieldEle.textContent) {
          newVal = parseData(fieldEle.textContent, activeRecords, rootRecord as Record<string, unknown>, scene);
        }
        newItem[fieldName] = newVal;
      }
    }
    resultParam.push(newItem);
  }
  return Array.isArray(requestParam) ? resultParam : resultParam[0];
};

const api2ResponseFields = async (apiElement: ApiElement, modelModel: string) => {
  const responseFields: IModelField[] = [] as IModelField[];
  await fieldElement2ResponseFields(apiElement ? apiElement.response.fields : [], modelModel, responseFields);
  return responseFields;
};

const api2ClearFields = async (apiElement: ApiElement, modelModel: string) => {
  const clearFields: IModelField[] = [] as IModelField[];
  await fieldElement2ResponseFields(apiElement.clear.fields, modelModel, clearFields);
  return clearFields;
};

const fieldElement2ResponseFields = async (
  fieldElements: FieldElement[],
  modelModel: string,
  fields: IModelField[] = [] as IModelField[]
) => {
  const model = await getModel(modelModel);
  for (const index in fieldElements) {
    const fieldEle = fieldElements[index];
    const modelField = model.modelFields.find((a) => a.name === fieldEle.name);
    if (!modelField) {
      // eslint-disable-next-line no-continue
      continue;
    }
    if (fieldEle.children && fieldEle.children.length > 0) {
      const subFields = [];
      fieldElement2ResponseFields(fieldEle.children, modelField.references!, subFields);
      modelField.modelFields = subFields;
    }
    fields.push(modelField);
  }
};

const contextElement2Variables = (
  contextElement: ContextElement,
  activeRecord: Entity,
  rootRecord: Entity,
  scene: string
): Entity => {
  if (!contextElement.props) {
    return {};
  }
  const variables = {};
  contextElement.props.forEach((prop) => {
    variables[prop.name!] = parseData(prop.textContent, [activeRecord as Entity], rootRecord as Entity, scene);
  });
  return variables;
};

const resolveChildrenCondition = (parentCondition: Record<string, any>, fields: FieldElement[]) => {
  fields.forEach((field) => {
    if (field.children && field.children.length) {
      parentCondition[field.name!] = {};
      resolveChildrenCondition(parentCondition[field.name!], field.children);
    } else {
      parentCondition[field.name!] = field.textContent || null;
    }
  });
};

/**
 * 解析对象，将对象中的 `value` 进行表达式计算
 *
 * @param {Object} condition 当前对象
 * @param {Object} activeRecord 表达式中需要的数据源
 * @param {Object} rootRecord 表达式中需要的根数据源
 *
 * @returns {Object} 经过表达式处理后的对象
 */
const parseExpressionData = (condition: Record<string, any>, activeRecord: Record<string, any>, rootRecord: Entity) => {
  const newCondition = JSON.parse(JSON.stringify(condition));

  Object.keys(newCondition).forEach((key) => {
    const textContent = newCondition[key];
    if (textContent) {
      if (typeof textContent === 'object' && Object.keys(textContent).length) {
        newCondition[key] = parseExpressionData(textContent, activeRecord, rootRecord);
      } else {
        newCondition[key] = parseData(textContent, [activeRecord], rootRecord, '');
      }
    } else {
      newCondition[key] = textContent;
    }
  });

  return newCondition;
};

const parseData = (textContent: string | undefined, activeRecords: Entity[], rootRecord: Entity, scene: string) => {
  if (!textContent) {
    return textContent;
  }
  const reg = /\$[\!,\?,\#]?\{([^\}]+)\}/g;
  const value = reg.exec(textContent);
  if (!value) {
    return textContent;
  }

  Expression.getInstance().initExpressionContext(activeRecords, rootRecord || {}, {}, scene);
  try {
    const res = Expression.getInstance().exec(value[1]);
    return res;
  } catch (e) {
    console.error(e);
    throw e;
  } finally {
    Expression.getInstance().cleanupExpressionContext();
  }
};
const customMutationByApi = async (
  apiElement: ApiElement,
  modelModel: string,
  record: Entity,
  context: Entity = {} as Entity
) => {
  const requestFields = [] as IModelField[];
  const scene = useMatched().matched.segmentParams?.page?.scene;
  const responseFields = await api2ResponseFields(apiElement, modelModel);
  const reqParam = await api2RequestParam(
    apiElement ? apiElement.request.fields : [],
    modelModel,
    record,
    [record],
    record,
    scene,
    requestFields
  );
  const variables = contextElement2Variables(apiElement.context, record, record, scene);
  const res = await customMutation(
    modelModel,
    apiElement.fun,
    Array.isArray(reqParam) ? reqParam[0] : reqParam,
    requestFields,
    responseFields,
    variables,
    context
  );
  await clearFieldsByApi(apiElement, modelModel, record);
  return res;
};
const customQueryByApi = async (
  apiElement: ApiElement,
  modelModel: string,
  record: Entity,
  context: Entity = {} as Entity
) => {
  const requestFields = [] as IModelField[];
  const scene = useMatched().matched.segmentParams?.page?.scene;
  const reqParam = await api2RequestParam(
    apiElement.request.fields,
    modelModel,
    record,
    [record],
    record,
    scene,
    requestFields
  );
  const responseFields = await api2ResponseFields(apiElement, modelModel);
  const variables = contextElement2Variables(apiElement.context, record, record, scene);
  const data = customQuery(
    modelModel,
    apiElement.fun,
    Array.isArray(reqParam) ? reqParam[0] : reqParam,
    requestFields,
    responseFields,
    variables,
    context
  );
  await clearFieldsByApi(apiElement, modelModel, record);
  return data;
};
const clearFieldsByApi = async (apiElement: ApiElement, modelModel: string, formData: Entity) => {
  const clearFields = await api2ClearFields(apiElement, modelModel);
  const model = await getModel(modelModel);
  clearFieldsData(
    clearFields.map((a) => a.name),
    model,
    formData
  );
};
/**
 * 清理指定对象的多个字段对应的值，需要根据字段类型清理
 * @param clearFields
 * @param model
 * @param formData
 */
const clearFieldsData = (clearFields: string[], model: IModel, formData: FORM_DATA) => {
  if (!clearFields || !model || !formData) {
    console.warn('clearFieldsData miss arg', clearFields, model, formData);
    return;
  }
  clearFields
    .map((name) => model.modelFields.find((mf) => mf.name === name)!)
    .forEach((field) => {
      if (field.ttype === ModelFieldType.ManyToMany || field.ttype === ModelFieldType.OneToMany) {
        formData[field.name] = [];
      } else if (field.ttype === ModelFieldType.ManyToOne || field.ttype === ModelFieldType.OneToOne) {
        formData[field.name] = {};
      } else {
        formData[field.name] = null;
      }
    });
};
const customQueryPageByApi = async (
  apiElement: ApiElement,
  modelModel: string,
  record: Entity,
  context: Entity = {} as Entity,
  option: IQueryPageOption
): Promise<IQueryPageResult<any>> => {
  const requestFields = [];
  const responseFields = await api2ResponseFields(apiElement, modelModel);
  const scene = useMatched().matched.segmentParams?.page?.scene;
  const reqParam = await api2RequestParam(
    apiElement.request.fields,
    modelModel,
    record,
    [record],
    record,
    scene,
    requestFields
  );
  const queryPageResult = await customQueryPage(
    modelModel,
    apiElement.fun,
    { ...option, record: reqParam },
    requestFields,
    responseFields,
    undefined,
    undefined
  );
  return queryPageResult;
};
const requestMutationByActionElement = async (
  serverAction: RuntimeServerAction,
  actionElement: ActionElement,
  record: Entity | Entity[],
  context: Entity = {} as Entity
) => {
  const apiElement = actionElement.api;
  const requestFields = [] as IModelField[];
  const scene = useMatched().matched.segmentParams?.page?.scene;
  const activeRecord = Array.isArray(record) ? {} : record;
  const activeRecords = Array.isArray(record) ? record : [record];
  const reqParam = await api2RequestParam(
    apiElement ? apiElement.request.fields : [],
    serverAction.model,
    [ActionContextType.SingleAndBatch, ActionContextType.Batch].includes(serverAction.contextType)
      ? activeRecords
      : activeRecord,
    activeRecords,
    activeRecord,
    scene,
    requestFields
  );
  const responseFields = await api2ResponseFields(apiElement, serverAction.model);
  const variables = contextElement2Variables(
    (apiElement ? apiElement.context : {}) as ContextElement,
    activeRecord,
    activeRecord,
    scene
  );
  const res = await requestMutation(
    serverAction.model,
    serverAction as unknown as IServerAction,
    reqParam,
    requestFields,
    responseFields,
    { ...(variables || {}), path: serverAction.sessionPath },
    context
  );
  // await clearFieldsByApi(apiElement, serverAction.model, Array.isArray(record) ? record[0] : record);
  return res;
};
const createDataWithPrimaryKeys = (primaryKeys: string[], formData: FORM_DATA) => {
  const data = {};
  primaryKeys = primaryKeys || [];
  for (let i = 0; i < primaryKeys.length; i++) {
    const fieldName = primaryKeys[i];
    if (formData[fieldName] != null) {
      data[fieldName] = formData[fieldName];
    }
  }
  return data;
};

const createRelationQueryData = (referenceFields: string[], relationFields: string[], formData: FORM_DATA) => {
  const queryData = {};
  const length = referenceFields.length;
  for (let i = 0; i < length; i++) {
    const referenceField = referenceFields[i];
    const relationField = relationFields[i];
    if (formData[relationField] != null) {
      queryData[referenceField] = formData[relationField];
    }
  }
  return queryData;
};

export const resolveDynamicExpression = (
  expression: string,
  activeRecords: Entity | Entity[] = {},
  rootData: Entity = {},
  openerData: Entity,
  scene?: string,
  parentRecord?: Entity
): string => {
  const { page = {} } = useMatched().matched.segmentParams;
  activeRecords = Array.isArray(activeRecords) ? activeRecords : [activeRecords || {}];
  Expression.getInstance().initExpressionContext(
    activeRecords,
    rootData || {},
    openerData,
    scene || page.scene,
    null,
    parentRecord
  );
  if (!expression) {
    Expression.getInstance().cleanupExpressionContext();
    return '';
  }

  const reg = /\$[\!,\?,\#]?\{([^\}]+)\}/g;
  const contrastObj: Record<string, string | null> = {};
  const matchArr: string[] = [];
  let tempResult = reg.exec(expression);
  const typeArr: string[] = [];
  // 匹配到${}中的值,存入数组中
  while (tempResult !== null) {
    matchArr.push(tempResult[1]);
    const type = tempResult[0].charAt(1);
    if (type !== '{') {
      typeArr.push(tempResult[0].substr(1, 1));
    } else {
      typeArr.push('');
    }
    tempResult = reg.exec(expression);
  }

  // matchArr.length === 0` 时代表 `domain` 可能是一个 `id == xxx` 的静态条件，
  // 这时直接返回原值就好
  if (matchArr.length === 0) {
    return expression;
  }

  // 获取activeRecord中对应的匹配到的值,存入_contrastObj对照对象中
  const _matchLength = matchArr.length;

  for (let _matchIndex = 0; _matchIndex < _matchLength; _matchIndex++) {
    const _matchItem = matchArr[_matchIndex];
    const _type = typeArr[_matchIndex];
    if (_type === '#') {
      contrastObj[_matchItem] = `\${${_matchItem}}`;
    } else {
      try {
        const value = Expression.getInstance().exec(_matchItem);
        if (value === false) {
          contrastObj[_matchItem] = 'false' as string;
        } else {
          contrastObj[_matchItem] = (value as string) || null;
        }
        if (_type === '!' && contrastObj[_matchItem] === null) {
          contrastObj[_matchItem] = '';
        }
      } catch (e) {
        // 解析失败后返回原始值，可能会对业务造成未知错误
        console.warn(
          `parse expression fail, expression:${expression} , currentExpressionItem: ${_matchItem} , and then return the origin value`,
          e
        );
        contrastObj[_matchItem] = `\${${_matchItem}}`;
      }
    }
  }

  Expression.getInstance().cleanupExpressionContext();
  const expResult = expression.replace(reg, (matchWithBrackets, matchExp: string): string => {
    if (matchExp) {
      return contrastObj[matchExp] as string;
    }
    // 兼容用户配置错误,正则没有匹配到变量
    return '';
  });
  return expResult;
};

const resolveDynamicDomain = (
  domain: string,
  activeRecords: Entity | Entity[] = {},
  rootData: Entity = {},
  openerData: Entity,
  scene?: string,
  parentRecord?: Entity
): string => {
  Expression.getInstance().cleanupExpressionContext();
  let expResultDomain = resolveDynamicExpression(domain, activeRecords, rootData, openerData, scene, parentRecord);
  const universalWhereRsql = ' 1==1 ';
  expResultDomain = expResultDomain?.replaceAll(`=='null'`, '==null');
  expResultDomain = expResultDomain?.replaceAll(`!='null'`, '!=null');
  expResultDomain = expResultDomain?.replaceAll('==null', '=isnull=true');
  expResultDomain = expResultDomain?.replaceAll('!=null', '=notnull=true');
  expResultDomain = expResultDomain?.replaceAll(/\s*[a-zA-Z]+\w*\s*=(in|out)=\s*(\(\)|\(null\))/g, universalWhereRsql);
  // 解决二进制枚举的值为空的问题
  expResultDomain = expResultDomain?.replaceAll(
    /\s*[a-zA-Z]+\w*\s*=(notbit|bit|contain|notcontain)=\s*(''|null|'null')/g,
    universalWhereRsql
  );
  expResultDomain = expResultDomain?.replaceAll(
    /\s*[a-zA-Z]+\w*\s*=(has|hasnt)=\s*(\(\)|\(''\)|\(null\)|\('null'\))/g,
    universalWhereRsql
  );

  return expResultDomain;
};

export {
  api2RequestParam,
  api2ResponseFields,
  contextElement2Variables,
  parseExpressionData,
  parseData,
  clearFieldsData,
  customQueryByApi,
  customQueryPageByApi,
  customMutationByApi,
  requestMutationByActionElement,
  createDataWithPrimaryKeys,
  createRelationQueryData,
  resolveDynamicDomain
};
