import {
  ApiElement,
  createApiElement,
  Entity,
  FieldElement,
  IDslNode,
  IModelField,
  isEmptyKeObject,
  LoadType,
  ModelFieldSerializeType,
  ModelFieldType,
  ModelType,
  QueryType
} from '@oinone/kunlun-meta';
import { Condition } from '@oinone/kunlun-request';
import {
  customQuery,
  customQueryPage,
  DEFAULT_TRUE_CONDITION,
  getModel,
  IQueryPageOption,
  IQueryPageResult,
  queryOne,
  queryPage
} from '@oinone/kunlun-service';
import {
  BooleanHelper,
  GraphqlHelper,
  RSQLCompositeOperators,
  RSQLLogicalOperator,
  RSQLOperators
} from '@oinone/kunlun-shared';
import { ExperimentalConfigManager } from '../experimental';
import {
  getRealTtype,
  getStaticRelationField,
  isRelationField,
  isStaticRelationField,
  RuntimeContext
} from '../runtime-context';
import {
  RuntimeM2MField,
  RuntimeModel,
  RuntimeModelField,
  RuntimeO2MField,
  RuntimeRelationField,
  RuntimeSearchField
} from '../runtime-metadata';
import { FORM_DATA } from '../typing';
import { createDataWithPrimaryKeys, customQueryByApi, customQueryPageByApi, resolveDynamicDomain } from './dataParse';
import { RSQLConditionOperators, RSQLValueType } from './RSQLConditionOperators';
import { isStandardBoolean, isStandardNumber, isStandardString } from './typing';

// m2o o2o
const queryFieldData4FormSelect = async (
  field: IModelField,
  fieldElement: FieldElement,
  fields: IModelField[] | undefined,
  parentDslNode: IDslNode,
  value: any,
  formData: FORM_DATA,
  activeRecords: Entity[],
  rootRecord: Entity,
  scene: string
): Promise<Entity> => {
  if (fieldElement.loadApi || fieldElement.load) {
    const data = await queryFieldData4Form(
      field,
      fieldElement,
      fields,
      parentDslNode,
      formData,
      activeRecords,
      rootRecord,
      scene
    );
    formData[field.name] = data;
    return formData[field.name] as Entity;
  }
  if (value) {
    if (isEmptyKeObject(value)) {
      const { references, referenceFields, relationFields } = field;
      if (!references || !referenceFields || !relationFields) {
        formData[field.name] = {};
        return {} as Entity;
      }
      const queryData = createM2OQueryData(relationFields, referenceFields, formData);
      let data = {};
      const mainModel = await getModel(field.model);
      if (!field.relationStore && mainModel.type !== ModelType.TRANSIENT) {
        if (Object.keys(queryData).length > 0) {
          const req = {};
          mainModel.pk.forEach((fieldName) => {
            req[fieldName] = formData[fieldName];
          });
          const d = await queryOne(field.model, req, [field], undefined, { maxDepth: 1 });
          formData[field.name] = d[field.name];
          return d[field.name];
        }
      }
      if (Object.keys(queryData).length > 0) {
        data = ((await queryOne(references, queryData)) as Entity) || {};
      }
      return (formData[field.name] = data);
    }
    formData[field.name] = value as Entity;
  }
  return formData[field.name] as Entity;
};
// m2o o2o
const queryFieldData4Form = async (
  modelField: IModelField,
  fieldElement: FieldElement,
  fields: IModelField[] | undefined,
  parentDslNode: IDslNode,
  formData: FORM_DATA,
  activeRecords: Entity[],
  rootRecord: Entity,
  scene: string
) => {
  if (fieldElement.loadApi) {
    const apiElement = createApiElement(parentDslNode, fieldElement.loadApi);
    if (!apiElement) {
      throw new Error(`api not fund: ${fieldElement.loadApi}`);
    }
    return queryFieldData4DetailByApi(modelField, apiElement, formData, activeRecords, rootRecord, scene);
  }
  if (fieldElement.load) {
    return queryFieldData4DetailByLoad(
      modelField,
      fieldElement.queryType,
      fieldElement.load,
      fieldElement.loadType,
      fieldElement.domain,
      fields,
      formData,
      activeRecords,
      rootRecord,
      scene
    );
  }
  return formData[modelField.name] as Entity;
};
// m2o o2o
const queryFieldData4Detail = async (
  modelField: IModelField,
  fieldElement: FieldElement,
  fields: IModelField[] | undefined,
  parentDslNode: IDslNode,
  formData: FORM_DATA,
  activeRecords: Entity[],
  rootRecord: Entity,
  scene: string
) => {
  if (fieldElement.loadApi) {
    const apiElement = createApiElement(parentDslNode, fieldElement.loadApi);
    if (!apiElement) {
      throw new Error(`api not fund: ${fieldElement.loadApi}`);
    }
    return queryFieldData4DetailByApi(modelField, apiElement, formData, activeRecords, rootRecord, scene);
  }
  if (fieldElement.load) {
    return queryFieldData4DetailByLoad(
      modelField,
      fieldElement.queryType,
      fieldElement.load,
      fieldElement.loadType,
      fieldElement.domain,
      fields,
      formData,
      activeRecords,
      rootRecord,
      scene
    );
  }
  return formData[modelField.name];
};
// m2o o2o
const queryFieldData4DetailByApi = async (
  modelField: IModelField,
  apiElement: ApiElement,
  activeRecord: Entity,
  activeRecords: Entity[],
  rootRecord: Entity,
  scene: string
) => {
  if (apiElement.type === LoadType.SERVER) {
    return customQueryByApi(apiElement, apiElement.model || modelField!.references!, activeRecord, undefined);
  }
  if (apiElement.type === LoadType.CLIENT) {
    // TODO 待支持
    return null;
  }
  console.warn(`不支持的类型${apiElement.type}`);
  return null;
};
// m2o o2o
const queryFieldData4DetailByLoad = async (
  modelField: IModelField,
  queryType: QueryType,
  load: string,
  loadType: LoadType,
  domain: string,
  fields: IModelField[] | undefined,
  activeRecord: Entity,
  activeRecords: Entity[],
  rootRecord: Entity,
  scene: string
) => {
  if (loadType === LoadType.SERVER) {
    queryType = queryType || QueryType.DOMAIN;
    if (QueryType.DOMAIN === queryType) {
      if (!modelField.referenceFields || !modelField.relationFields) {
        return null;
      }
      const queryData = createM2OQueryData(modelField.relationFields, modelField.referenceFields, activeRecord);
      let data = {};
      if (Object.keys(queryData).length > 0) {
        data = (await queryOne(modelField.references!, queryData)) as Record<string, unknown>;
      }
      return data;
    }
    if (QueryType.OBJECT === queryType) {
      const content = await customQuery(
        modelField!.references!,
        load,
        activeRecord,
        fields,
        fields,
        undefined,
        undefined
      );
      return content;
    }
    if (QueryType.LIST === queryType) {
      const content = await customQuery(
        modelField!.references!,
        load,
        activeRecords,
        fields,
        fields,
        undefined,
        undefined
      );
      return content;
    }
    return null;
  }
  if (loadType === LoadType.CLIENT) {
    // TODO 待支持
    return [];
  }
  console.warn(`不支持的类型${loadType}`);
  return null;
};
const createM2OQueryData = (relationFields: string[], referenceFields: string[], formData: Entity) => {
  const queryData = {};
  for (let i = 0; i < referenceFields.length; i++) {
    const referenceField = referenceFields[i];
    const relationField = relationFields[i];
    // # 开头的是后端placeholder的占位符参数，后端会解析替换
    if (relationField.startsWith('#')) {
      queryData[referenceField] = relationField.slice(1, relationField.length - 1);
    } else if (formData[relationField] != null) {
      queryData[referenceField] = formData[relationField];
    }
  }
  return queryData;
};
// o2m m2m
const queryFieldDataList4Form = async (
  modelField: IModelField,
  fieldElement: FieldElement,
  fields: IModelField[] | undefined,
  parentDslNode: IDslNode,
  formData: FORM_DATA,
  activeRecords: Entity[],
  rootRecord: Entity,
  scene: string
) => {
  if (fieldElement.loadApi) {
    const apiElement = createApiElement(parentDslNode, fieldElement.loadApi);
    if (!apiElement) {
      throw new Error(`api not fund: ${fieldElement.loadApi}`);
    }
    const pageRes = await queryFieldDataList4DetailByApi(
      modelField,
      apiElement,
      fieldElement.limit,
      formData,
      activeRecords,
      rootRecord,
      scene
    );
    return pageRes.content || [];
  }
  if (fieldElement.load) {
    return queryFieldDataList4DetailByLoad(
      modelField,
      fieldElement.queryType,
      fieldElement.load,
      fieldElement.loadType,
      fieldElement.domain,
      fieldElement.limit,
      fields,
      formData,
      activeRecords,
      rootRecord,
      scene
    );
  }
  if (!modelField.relationStore) {
    return formData[modelField.name] as Entity[];
  }
  const { references, referenceFields, relationFields } = modelField;
  if (!references || !referenceFields || !relationFields) {
    return [];
  }
  // o2m m2m 数据为数组
  if (formData[modelField.name] && formData[modelField.name].length > 0) {
    return formData[modelField.name] as Entity[];
  }
  // 不知道为什么之前v2的逻辑要这样取数据，会重复取很多次
  const model = await getModel(modelField.model!);
  const queryData = createDataWithPrimaryKeys(model.pk, formData);
  let dataList = [];
  if (Object.keys(queryData).length > 0) {
    const dict = await queryOne(modelField.model!, queryData, [modelField], undefined, { maxDepth: 1 });
    dataList = dict[modelField.name] || [];
  }
  return dataList;
};

const queryFieldDataList4Detail = async (
  modelField: IModelField,
  fieldElement: FieldElement,
  fields: IModelField[] | undefined,
  parentDslNode: IDslNode,
  formData: FORM_DATA,
  activeRecords: Entity[],
  rootRecord: Entity,
  scene: string
) => {
  if (fieldElement.loadApi) {
    const apiElement = createApiElement(parentDslNode, fieldElement.loadApi);
    if (!apiElement) {
      throw new Error(`api not fund: ${fieldElement.loadApi}`);
    }
    const pageRes = await queryFieldDataList4DetailByApi(
      modelField,
      apiElement,
      fieldElement.limit,
      formData,
      activeRecords,
      rootRecord,
      scene
    );
    return pageRes.content;
  }
  if (fieldElement.load) {
    return queryFieldDataList4DetailByLoad(
      modelField,
      fieldElement.queryType,
      fieldElement.load,
      fieldElement.loadType,
      fieldElement.domain,
      fieldElement.limit,
      fields,
      formData,
      activeRecords,
      rootRecord,
      scene
    );
  }
  return formData[modelField.name];
};
const queryFieldDataList4DetailByApi = async (
  modelField: IModelField,
  apiElement: ApiElement,
  pageSize: number,
  activeRecord: Entity,
  activeRecords: Entity[],
  rootRecord: Entity,
  scene: string
): Promise<IQueryPageResult<any>> => {
  if (apiElement.type === LoadType.SERVER) {
    return customQueryPageByApi(apiElement, apiElement.model || modelField!.references!, activeRecord, undefined, {
      pageSize
    } as IQueryPageOption);
  }
  if (apiElement.type === LoadType.CLIENT) {
    // TODO 待支持
    return {} as IQueryPageResult<any>;
  }
  console.warn(`不支持的类型${apiElement.type}`);
  return {} as IQueryPageResult<any>;
};

const queryFieldDataList4DetailByLoad = async (
  modelField: IModelField,
  queryType: QueryType,
  load: string,
  loadType: LoadType,
  domain: string,
  limit: number,
  fields: IModelField[] | undefined,
  activeRecord: Entity,
  activeRecords: Entity[],
  rootRecord: Entity,
  scene: string
): Promise<any[] | null> => {
  if (loadType === LoadType.SERVER) {
    queryType = queryType || QueryType.DOMAIN;
    if (QueryType.DOMAIN === queryType) {
      domain = resolveDynamicDomain(domain, activeRecord, rootRecord, {});

      const condition = new Condition('1==1');
      if (Object.keys(activeRecord).length !== 0) {
        const referencesModel = await getModel(modelField.references!);
        condition.and(buildQueryCondition(referencesModel! as unknown as RuntimeModel, activeRecord, {}, []));
      }
      if (domain !== '') {
        condition.and(new Condition(domain));
      }

      const { content } = await customQueryPage(
        modelField!.references!,
        load,
        { condition, pageSize: limit },
        fields,
        fields,
        undefined,
        undefined
      );
      return content;
    }
    if (QueryType.OBJECT === queryType) {
      const { content } = await customQueryPage(
        modelField!.references!,
        load,
        { record: activeRecords, pageSize: limit },
        fields,
        fields,
        undefined,
        undefined
      );
      return content;
    }
    if (QueryType.LIST === queryType) {
      const { content } = await customQueryPage(
        modelField!.references!,
        load,
        { record: activeRecords, pageSize: limit },
        fields,
        fields,
        undefined,
        undefined
      );
      return content;
    }
    return [];
  }
  if (loadType === LoadType.CLIENT) {
    // TODO 待支持
    return [];
  }
  console.warn(`不支持的类型${loadType}`);
  return null;
};
const queryFieldDataList4Options = async (
  modelField: IModelField,
  fieldElement: FieldElement,
  fields: IModelField[] | undefined,
  parentDslNode: IDslNode,
  formData: FORM_DATA,
  activeRecords: Entity[],
  rootRecord: Entity,
  scene: string
) => {
  if (fieldElement.optionsLoadApi) {
    const apiElement = createApiElement(parentDslNode, fieldElement.optionsLoadApi);
    if (!apiElement) {
      throw new Error(`optionsLoadApi not fund: ${fieldElement.optionsLoadApi}`);
    }
    return queryFieldDataList4OptionsByApi(
      modelField,
      apiElement,
      fieldElement.optionsLimit,
      formData,
      activeRecords,
      rootRecord,
      scene
    );
  }
  if (fieldElement.load) {
    return queryFieldDataList4OptionsByLoad(
      modelField,
      fieldElement.optionsLoad,
      fieldElement.optionsLoadType,
      fieldElement.domain,
      fieldElement.optionsLimit,
      fields,
      formData,
      activeRecords,
      rootRecord,
      scene
    );
  }
  return formData[modelField.name];
};
const queryFieldDataList4OptionsByApi = async (
  modelField: IModelField,
  apiElement: ApiElement,
  pageSize: number,
  activeRecord: Entity,
  activeRecords: Entity[],
  rootRecord: Entity,
  scene: string
): Promise<IQueryPageResult<any>> => {
  if (apiElement.type === LoadType.SERVER) {
    return customQueryPageByApi(apiElement, apiElement.model || modelField!.references!, activeRecord, undefined, {
      pageSize
    } as IQueryPageOption);
  }
  if (apiElement.type === LoadType.CLIENT) {
    // TODO 待支持
    return {} as IQueryPageResult<any>;
  }
  console.warn(`不支持的类型${apiElement.type}`);
  return {} as IQueryPageResult<any>;
};

const queryFieldDataList4OptionsByLoad = async (
  modelField: IModelField,
  load: string,
  loadType: LoadType,
  domain: string,
  limit: number,
  fields: IModelField[] | undefined,
  activeRecord: Entity,
  activeRecords: Entity[],
  rootRecord: Entity,
  scene: string
): Promise<IQueryPageResult<any>> => {
  if (loadType === LoadType.SERVER) {
    const condition = new Condition('1==1');
    if (Object.keys(activeRecord).length !== 0) {
      const referencesModel = await getModel(modelField.references!);
      condition.and(buildQueryCondition(referencesModel! as unknown as RuntimeModel, activeRecord, {}, []));
    }
    if (domain !== '') {
      condition.and(new Condition(domain));
    }
    return customQueryPage(
      modelField!.references!,
      load,
      { condition: domain, record: activeRecord, pageSize: limit },
      fields,
      fields,
      undefined,
      undefined
    );
  }
  if (loadType === LoadType.CLIENT) {
    // TODO 待支持
    return {} as IQueryPageResult<any>;
  }
  console.warn(`不支持的类型${loadType}`);
  return {} as IQueryPageResult<any>;
};
/**
 * 查询当前字段关联关系模型的分页数据 M2M使用
 * @param modelField 模型本身的字段
 * @param currentModelData 当前模型的数据
 * @param options 查询条件
 */
const queryM2MRelationDataPage = async (
  modelField: IModelField,
  currentModelData: Entity = {},
  options: IQueryPageOption = { pageSize: 500 }
) => {
  const queryParam = createM2MQueryParam(modelField, currentModelData);
  if (Object.keys(queryParam).length === 0) {
    return {
      content: [],
      totalElements: 0,
      size: 0,
      totalPages: 0
    } as IQueryPageResult<any>;
  }

  const condition = new Condition('1==1');
  Object.keys(queryParam).forEach((name) => {
    condition.and(new Condition(name).equal(queryParam[name]));
  });
  return queryPage(modelField.through!, { ...options, condition });
};
/**
 * 将当前模型的字段转换为关联关系模型的查询条件的对象 M2M使用
 * @param modelField 模型本身的字段
 * @param currentModelData 当前模型的数据
 */
const createM2MQueryParam = (modelField: IModelField, currentModelData: Entity = {}) => {
  const queryParam = {};
  Object.keys(currentModelData).forEach((name) => {
    const index = modelField.relationFields!.findIndex((ref) => ref === name);
    if (index !== -1) {
      Reflect.set(queryParam, modelField.throughRelationFields![index], Reflect.get(currentModelData, name));
    }
  });
  return queryParam;
};
/**
 * 根据中间模型创建关系模型的查询条件 M2M使用
 * @param modelField
 * @param relationDataList
 */
const createRelationCondition = (modelField: IModelField, relationDataList: Entity[]): Condition | undefined => {
  let condition: Condition | undefined;
  modelField.throughReferenceFields!.forEach((name, index) => {
    const queryBody = {};
    relationDataList.forEach((c) => {
      Reflect.set(queryBody, modelField.referenceFields![index], c[name]);
    });
    let localCondition: Condition | undefined;
    Object.keys(queryBody).forEach((_name) => {
      localCondition == null
        ? (localCondition = new Condition(_name).equal(Reflect.get(queryBody, _name)))
        : localCondition.and(new Condition(_name).equal(Reflect.get(queryBody, _name)));
    });
    condition == null
      ? (condition = localCondition && new Condition(localCondition.toString()))
      : localCondition && condition.or(localCondition);
  });
  return condition;
};

function isNeedAppendQueryCondition(field: RuntimeSearchField, isFrontSearch?: boolean): boolean {
  let { store } = field;
  if (isFrontSearch) {
    store = true;
  }
  if (isRelationField(field)) {
    const { relationFields, referenceFields } = field;
    if (isFrontSearch) {
      return !(!relationFields.length || !referenceFields.length);
    }
    return !(store || !relationFields.length || !referenceFields.length);
  }
  return store || !!field.allowSearch;
}

type GetModelFieldFunction = (field: string) => RuntimeModelField | undefined;

/**
 * 构建搜索条件
 * @param model 模型对象
 * @param content 模型对应的数据
 * @param extraContent url里的模型数据
 * @param extraConditions url里的模型搜索条件
 * @param isFrontSearch 前端搜索
 */
const buildQueryCondition = (
  model: RuntimeModel | RuntimeContext,
  content: Entity,
  extraContent: Entity = {},
  extraConditions?: { leftValue: string[]; operator: string; right: unknown }[],
  isFrontSearch?: boolean
): Condition => {
  const condition = new Condition('1==1');
  const mixedContent = { ...content, ...extraContent };
  if (mixedContent && Object.keys(mixedContent).length > 0) {
    condition.setConditionBodyData(mixedContent);
  } else {
    condition.setConditionBodyData({});
  }
  Object.keys(mixedContent).forEach((c) => {
    const val = mixedContent[c];
    if (val == null || val === '') {
      return;
    }
    const { getModelField } = model as RuntimeContext;
    const getModelFieldFn = (f: string): RuntimeModelField | undefined => {
      if (getModelField) {
        return getModelField(f)?.modelField;
      }
      return (model as RuntimeModel).modelFields?.find((mf) => mf.name === f);
    };
    const field: RuntimeSearchField | undefined = getModelFieldFn(c) as RuntimeSearchField | undefined;
    if (!field) {
      return;
    }
    if (!isNeedAppendQueryCondition(field, isFrontSearch)) {
      return;
    }

    const { operator: fieldOperator } = field;
    const realTtype = getRealTtype(field);
    if (val == null || (Array.isArray(val) && !val.length)) {
      return;
    }
    switch (realTtype) {
      case ModelFieldType.Integer:
      case ModelFieldType.Long:
      case ModelFieldType.Float:
      case ModelFieldType.Currency:
        if (Array.isArray(val)) {
          buildMultiNumberQueryCondition(field, condition, c, fieldOperator, val);
        } else if (isStandardNumber(val)) {
          buildNumberQueryCondition(condition, c, fieldOperator, val);
        }
        break;
      case ModelFieldType.String:
      case ModelFieldType.Text:
      case ModelFieldType.HTML:
      case ModelFieldType.Phone:
      case ModelFieldType.Email:
        if (Array.isArray(val)) {
          buildMultiStringQueryCondition(field, condition, c, fieldOperator, val, {
            quote: "'"
          });
        } else {
          const stringValue = `${val}`;
          if (isStandardString(stringValue)) {
            buildStringQueryCondition(condition, c, fieldOperator, stringValue);
          }
        }
        break;
      case ModelFieldType.Boolean:
        if (Array.isArray(val)) {
          buildMultiBooleanQueryCondition(condition, c, fieldOperator, val);
        } else if (isStandardBoolean(val)) {
          const boolVal = BooleanHelper.toBoolean(val);
          if (boolVal != null) {
            buildBooleanQueryCondition(condition, c, fieldOperator, boolVal);
          }
        }
        break;
      case ModelFieldType.DateTime:
      case ModelFieldType.Date:
      case ModelFieldType.Time:
        if (Array.isArray(val)) {
          buildDatetimeRangeQueryCondition(condition, c, fieldOperator, [val[0], val[1]]);
        } else if (isStandardString(val)) {
          buildDatetimeQueryCondition(condition, c, fieldOperator, val);
        }
        break;
      case ModelFieldType.Year:
        if (Array.isArray(val)) {
          buildYearRangeQueryCondition(condition, c, fieldOperator, [val[0], val[1]]);
        } else if (isStandardString(val)) {
          buildDatetimeQueryCondition(condition, c, fieldOperator, val);
        }
        break;
      case ModelFieldType.Enum:
      case ModelFieldType.MultiEnum:
        if (Array.isArray(val)) {
          if (field.multi && field.storeSerialize === ModelFieldSerializeType.BIT) {
            buildMultiBitEnumQueryCondition(condition, c, fieldOperator, val);
          } else {
            buildMultiEnumQueryCondition(field, condition, c, fieldOperator, val);
          }
        } else if (isStandardString(val)) {
          buildEnumQueryCondition(condition, c, fieldOperator, val);
        }
        break;
      case ModelFieldType.OneToMany: {
        const relationField = field as RuntimeO2MField;
        if (Array.isArray(val)) {
          buildO2MQueryCondition(relationField, condition, c, fieldOperator, val, { getModelFieldFn });
        }
        break;
      }
      case ModelFieldType.ManyToMany: {
        const relationField = field as RuntimeM2MField;
        if (Array.isArray(val)) {
          buildM2MQueryCondition(relationField, condition, c, fieldOperator, val, { getModelFieldFn });
        }
        break;
      }
      case ModelFieldType.ManyToOne:
      case ModelFieldType.OneToOne: {
        const relationField = field as RuntimeRelationField;
        if (Array.isArray(val)) {
          buildX2OMultiQueryCondition(relationField, condition, c, fieldOperator, val, { getModelFieldFn });
        } else {
          buildX2OQueryCondition(relationField, condition, c, fieldOperator, val as object, { getModelFieldFn });
        }
        break;
      }
    }
  });

  if (extraConditions) {
    extraConditions.forEach((con) => {
      const left = con.leftValue[con.leftValue.length - 1];
      if (con.operator !== 'between') {
        condition.and(new Condition(left).append(con.operator).append(new Condition(`'${con.right}'`).toString()));
      } else {
        const leftCd = new Condition(left)
          .greaterThanOrEuqalTo((<string[]>con.right)[0])
          .and(new Condition(left).lessThanOrEqualTo((<string[]>con.right)[1]));

        condition.and(leftCd);
      }
    });
  }

  return condition;
};

function buildStringQueryCondition(
  condition: Condition,
  selector: string,
  operator: string | undefined,
  value: string
) {
  value = GraphqlHelper.serializableSearchString(value);
  buildQueryConditionByType('string', condition, selector, operator, value, () =>
    condition.and(new Condition(selector).like(value))
  );
}

function buildMultiStringQueryCondition(
  field: RuntimeModelField | undefined,
  condition: Condition,
  selector: string,
  operator: string | undefined,
  values: string[],
  options?: {
    quote?: string;
    serializable?: boolean;
  }
) {
  const quote = options?.quote || '';
  let serializeFn;
  if (!options?.serializable) {
    serializeFn = (v) => v;
  } else if (quote) {
    serializeFn = GraphqlHelper.serializableSearchString;
  } else {
    serializeFn = GraphqlHelper.serializableSimpleString;
  }
  let joinOperator = ' and ';
  if (!operator) {
    if (field?.multi) {
      operator = RSQLOperators.LIKE.symbol;
    } else {
      operator = RSQLOperators.IN.symbol;
    }
  }
  if (operator === RSQLOperators.IN.symbol) {
    const cd = new Condition(selector).in(values.map((v) => `${quote}${serializeFn(v)}${quote}`)).toString();
    condition.and(new Condition(cd));
    return;
  }
  if (operator === RSQLOperators.NOT_IN.symbol) {
    const cd = new Condition(selector).notIn(values.map((v) => `${quote}${serializeFn(v)}${quote}`)).toString();
    condition.and(new Condition(cd));
    return;
  }
  if (
    !operator ||
    operator === RSQLOperators.LIKE.symbol ||
    operator.toLowerCase() === RSQLCompositeOperators.LIKE_OR
  ) {
    joinOperator = ' or ';
  }
  const multiArray: string[] = [];
  for (const value of values) {
    if (value != null) {
      const singleCondition = new Condition(selector)
        .like(GraphqlHelper.serializableSearchString(`${value}`))
        .toString();
      multiArray.push(singleCondition);
    }
  }
  if (multiArray.length > 0) {
    const cd = multiArray.join(joinOperator);
    condition.and(new Condition(cd));
  }
}

function buildEnumQueryCondition(condition: Condition, selector: string, operator: string | undefined, value: string) {
  buildQueryConditionByType('string', condition, selector, operator, value, () =>
    condition.and(new Condition(selector).equal(value))
  );
}

function buildMultiEnumQueryCondition(
  field: RuntimeModelField | undefined,
  condition: Condition,
  selector: string,
  operator: string | undefined,
  values: string[]
) {
  buildMultiStringQueryCondition(field, condition, selector, operator, values);
}

function buildMultiBitEnumQueryCondition(
  condition: Condition,
  selector: string,
  operator: string | undefined,
  value: string[]
) {
  buildQueryConditionByType('bit', condition, selector, operator, value, () =>
    condition.and(new Condition(selector).has(value))
  );
}

function buildNumberQueryCondition(
  condition: Condition,
  selector: string,
  operator: string | undefined,
  value: number | string
) {
  buildQueryConditionByType('number', condition, selector, operator, `${value}`, () =>
    condition.and(new Condition(selector).equal(value))
  );
}

function buildMultiNumberQueryCondition(
  field: RuntimeModelField,
  condition: Condition,
  selector: string,
  operator: string | undefined,
  values: string[]
) {
  if (field?.multi) {
    buildMultiStringQueryCondition(field, condition, selector, operator, values);
    return;
  }
  if (!operator) {
    operator = RSQLOperators.IN.symbol;
  }
  // 数字范围
  const operators = operator.split(',');
  if (operators.length === 2 && values.length === 2) {
    const [leftValue, rightValue] = values;
    if (leftValue == null || rightValue == null) {
      return;
    }
    const [leftOperator, rightOperator] = operators;
    const leftCondition = createQueryConditionByType('number', selector, leftOperator, leftValue);
    const rightCondition = createQueryConditionByType('number', selector, rightOperator, rightValue);
    if (!leftCondition || !rightCondition) {
      return;
    }
    condition.and(leftCondition.and(rightCondition));
    return;
  }
  // 多值数字
  switch (operator) {
    case '=in=':
      condition.and(new Condition(selector).in(values));
      break;
    case '=out=':
      condition.and(new Condition(selector).notIn(values));
      break;
    default:
      throw new Error(`Invalid operator: ${operator}`);
  }
}

function buildBooleanQueryCondition(
  condition: Condition,
  selector: string,
  operator: string | undefined,
  value: boolean
) {
  buildQueryConditionByType(
    'boolean',
    condition,
    selector,
    operator,
    `${value}`,
    () => condition.and(new Condition(selector).equal(value, true)),
    true
  );
}

function buildMultiBooleanQueryCondition(
  condition: Condition,
  selector: string,
  operator: string | undefined,
  value: string[]
) {
  return buildMultiStringQueryCondition(undefined, condition, selector, operator, value);
}

function buildDatetimeQueryCondition(
  condition: Condition,
  selector: string,
  operator: string | undefined,
  value: string
) {
  buildQueryConditionByType('datetime', condition, selector, operator, value, () =>
    condition.and(new Condition(selector).like(value))
  );
}

function buildDatetimeRangeQueryCondition(
  condition: Condition,
  selector: string,
  operator: string | undefined,
  value: [string, string]
) {
  const operators = operator?.split(',') || [];
  const [startValue, endValue] = value;
  const datetimeCondition = new Condition(DEFAULT_TRUE_CONDITION);
  buildQueryConditionByType('datetime', datetimeCondition, selector, operators[0], startValue, () =>
    datetimeCondition.and(new Condition(selector).greaterThanOrEuqalTo(startValue))
  );
  buildQueryConditionByType('datetime', datetimeCondition, selector, operators[1], endValue, () =>
    datetimeCondition.and(new Condition(selector).lessThan(endValue))
  );
  condition.and(datetimeCondition);
}

function buildYearRangeQueryCondition(
  condition: Condition,
  selector: string,
  operator: string | undefined,
  value: [string, string]
) {
  const operators = operator?.split(',') || [];
  const [startValue, endValue] = value;
  const yearCondition = new Condition(DEFAULT_TRUE_CONDITION);
  buildQueryConditionByType('datetime', yearCondition, selector, operators[0], startValue, () =>
    yearCondition.and(new Condition(selector).greaterThanOrEuqalTo(startValue))
  );
  buildQueryConditionByType('datetime', yearCondition, selector, operators[1], endValue, () =>
    yearCondition.and(new Condition(selector).lessThanOrEqualTo(endValue))
  );
  condition.and(yearCondition);
}

function createQueryConditionByType(
  type: RSQLValueType,
  selector: string,
  operator: string,
  value: string | string[],
  isPreprocess?: boolean
): Condition | undefined {
  const consumer = RSQLConditionOperators.get(type, operator);
  if (consumer) {
    return consumer(selector, value as unknown as string, isPreprocess);
  }
}

function buildQueryConditionByType(
  type: RSQLValueType,
  condition: Condition,
  selector: string,
  operator: string | undefined,
  value: string | string[],
  defaultConsumer: (condition: Condition) => void,
  isPreprocess?: boolean
) {
  if (!operator) {
    defaultConsumer(condition);
    return;
  }
  const nextCondition = createQueryConditionByType(type, selector, operator, value, isPreprocess);
  if (nextCondition) {
    condition.and(nextCondition);
  } else {
    defaultConsumer(condition);
  }
}

function buildO2MQueryCondition(
  field: RuntimeO2MField,
  condition: Condition,
  selector: string,
  operator: string | undefined,
  values: object[],
  options: { getModelFieldFn: GetModelFieldFunction }
) {
  const { name, relationFields, referenceFields } = field;
  buildDefaultX2MQueryCondition(name, relationFields, referenceFields, condition, values, options);
}

function buildM2MQueryCondition(
  field: RuntimeM2MField,
  condition: Condition,
  selector: string,
  operator: string | undefined,
  values: object[],
  options: { getModelFieldFn: GetModelFieldFunction }
) {
  const { name, referenceFields, throughReferenceFields } = field;
  buildDefaultX2MQueryCondition(name, throughReferenceFields, referenceFields, condition, values, options);
}

function buildDefaultX2MQueryCondition(
  field: string,
  relationFields: string[],
  referenceFields: string[],
  condition: Condition,
  values: object[],
  options: { getModelFieldFn: GetModelFieldFunction }
) {
  if (!relationFields?.length || !referenceFields?.length || relationFields.length !== referenceFields.length) {
    return;
  }
  let targetCondition: Condition | undefined;
  for (let i = 0; i < referenceFields.length; i++) {
    const referenceField = referenceFields[i];
    const throughReferenceField = relationFields[i];
    let targetField: string;
    let target: string | string[];
    if (isStaticRelationField(throughReferenceField)) {
      target = getStaticRelationField(throughReferenceField);
      targetField = referenceField;
    } else if (isStaticRelationField(referenceField)) {
      target = getStaticRelationField(referenceField);
      targetField = throughReferenceField;
    } else {
      target = buildTargetValues(values, referenceField);
      targetField = referenceField;
    }
    const nextCondition = buildX2MReferenceQueryCondition(field, targetField, target);
    if (nextCondition) {
      if (targetCondition) {
        targetCondition.and(nextCondition);
      } else {
        targetCondition = nextCondition;
      }
    }
  }
  if (targetCondition) {
    condition.and(targetCondition);
  }
}

function buildX2MReferenceQueryCondition(field: string, referenceField: string, value: string | string[] | null) {
  if (Array.isArray(value)) {
    // fixme @zbh 20241117 后端暂不支持IN查询
    // const condition = new Condition(`${field}.${referenceField}`);
    // condition.in(value);
    // return condition;
    const singleConditions: string[] = [];
    for (const item of value) {
      singleConditions.push(`${field}.${referenceField} == ${item}`);
    }
    if (!singleConditions.length) {
      return undefined;
    }
    return new Condition(singleConditions.join(` ${RSQLLogicalOperator.OR} `));
  }
  if (value === null) {
    return new Condition(`${field}.${referenceField}`).isNull();
  }
  return new Condition(`${field}.${referenceField}`).equal(value);
}

const RESOURCE_ADDRESS_FIELDS = ['countryCode', 'provinceCode', 'cityCode', 'districtCode', 'streetCode'];

function buildX2OQueryCondition(
  field: RuntimeRelationField,
  condition: Condition,
  selector: string,
  operator: string | undefined,
  value: object,
  options: { getModelFieldFn: GetModelFieldFunction }
) {
  const { name, references, relationFields, referenceFields } = field;
  if (!relationFields?.length || !referenceFields?.length || relationFields.length !== referenceFields.length) {
    return;
  }
  if (references === 'resource.ResourceAddress') {
    let targetCondition: Condition | undefined;
    for (const addressField of RESOURCE_ADDRESS_FIELDS) {
      const addressValue = value[addressField];
      if (addressValue) {
        if (targetCondition) {
          targetCondition.and(new Condition(`${name}.${addressField}`).equal(addressValue));
        } else {
          targetCondition = new Condition(`${name}.${addressField}`).equal(addressValue);
        }
      }
    }
    if (targetCondition) {
      condition.and(targetCondition);
    }
    return;
  }
  let targetCondition: Condition | undefined;
  for (let i = 0; i < relationFields.length; i++) {
    const relationField = relationFields[i];
    const referenceField = referenceFields[i];
    let targetField: string;
    let target: string;
    if (isStaticRelationField(relationField)) {
      continue;
    } else if (isStaticRelationField(referenceField)) {
      target = getStaticRelationField(referenceField);
      targetField = relationField;
    } else {
      if (ExperimentalConfigManager.buildQueryConditionNext()) {
        const relationModelField = options?.getModelFieldFn(relationField);
        if (relationModelField) {
          if (relationModelField.store) {
            target = value[referenceField];
            targetField = relationField;
          } else {
            condition.getConditionBodyData()[relationField] = value[referenceField];
            return;
          }
        } else {
          target = value[referenceField];
          targetField = relationField;
        }
      } else {
        target = value[referenceField];
        targetField = relationField;
      }
    }
    if (targetCondition) {
      targetCondition.and(new Condition(`${targetField}`).equal(target));
    } else {
      targetCondition = new Condition(`${targetField}`).equal(target);
    }
  }
  if (targetCondition) {
    condition.and(targetCondition);
  }
}

function buildX2OMultiQueryCondition(
  field: RuntimeRelationField,
  condition: Condition,
  selector: string,
  operator: string | undefined,
  values: object[],
  options: { getModelFieldFn: GetModelFieldFunction }
) {
  const { relationFields, referenceFields } = field;
  if (!relationFields?.length || !referenceFields?.length || relationFields.length !== referenceFields.length) {
    return;
  }
  let targetCondition: Condition | undefined;
  for (let i = 0; i < relationFields.length; i++) {
    const relationField = relationFields[i];
    const referenceField = referenceFields[i];
    let targetField: string;
    let target: string | string[];
    if (isStaticRelationField(relationField)) {
      target = getStaticRelationField(relationField);
      targetField = referenceField;
    } else if (isStaticRelationField(referenceField)) {
      target = getStaticRelationField(referenceField);
      targetField = relationField;
    } else {
      if (ExperimentalConfigManager.buildQueryConditionNext()) {
        const relationModelField = options?.getModelFieldFn(relationField);
        if (relationModelField) {
          if (relationModelField.store) {
            target = buildTargetValues(values, referenceField);
            targetField = relationField;
          } else {
            condition.getConditionBodyData()[relationField] = buildTargetValues(values, referenceField);
            return;
          }
        } else {
          target = buildTargetValues(values, referenceField);
          targetField = relationField;
        }
      } else {
        target = buildTargetValues(values, referenceField);
        targetField = relationField;
      }
    }
    const nextCondition = buildX2OReferenceQueryCondition(targetField, target);
    if (nextCondition) {
      if (targetCondition) {
        targetCondition.and(nextCondition);
      } else {
        targetCondition = nextCondition;
      }
    }
  }
  if (targetCondition) {
    condition.and(targetCondition);
  }
}

function buildX2OReferenceQueryCondition(relationField: string, value: string | string[] | null) {
  if (Array.isArray(value)) {
    const condition = new Condition(`${relationField}`);
    condition.in(value);
    return condition;
  }
  if (value === null) {
    return new Condition(relationField).isNull();
  }
  return new Condition(relationField).equal(value);
}

function buildTargetValues(values: object[], field: string) {
  return values
    .map((v) => {
      const target = v[field];
      if (target == null) {
        return '';
      }
      return `${target}`;
    })
    .filter((v) => !!v);
}

/**
 * @deprecated 错误的获取关联字段方法
 */
export function getRelationFieldKey(field: RuntimeRelationField, referencesModel?: RuntimeModel): string {
  const { ttype, referenceFields } = field;
  // m2o o2o的referenceFields存在当前模型，是把关系模型的字段存到当前模型
  // o2m的referenceFields存在关系模型，只有等当前模型保存后referenceFields才能有值，是把当前模型的字段存到关系模型
  // m2m的referenceFields存在中间模型，只有等当前模型保存后referenceFields才能有值，是把当前模型和关系模型的字段存到中间模型
  if ([ModelFieldType.ManyToOne, ModelFieldType.OneToOne].includes(ttype) && referenceFields?.length === 1) {
    return referenceFields[0];
  }
  return referencesModel?.pks?.[0] || 'id';
}

export {
  queryFieldData4FormSelect,
  queryFieldData4Form,
  queryFieldData4Detail,
  queryFieldData4DetailByApi,
  queryFieldData4DetailByLoad,
  queryFieldDataList4Form,
  queryFieldDataList4Detail,
  queryFieldDataList4DetailByApi,
  queryFieldDataList4DetailByLoad,
  queryFieldDataList4Options,
  queryM2MRelationDataPage,
  createM2MQueryParam,
  createRelationCondition,
  createM2OQueryData,
  isNeedAppendQueryCondition,
  buildQueryCondition
};
