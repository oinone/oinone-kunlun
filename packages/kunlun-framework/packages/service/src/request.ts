import {
  BASE_RSQL_QUERY_CONDITION,
  deepClone,
  Entity,
  IAction,
  IModel,
  IModelField,
  IModelFunc,
  IModule,
  IServerAction,
  ISharedViewAction,
  isSimpleField,
  IView,
  IViewAction,
  MetadataFragment,
  MetadataRuntimeFragment,
  MetadataRuntimeFragmentName,
  ModelFieldType,
  SYSTEM_MODULE_NAME
} from '@kunlun/meta';
import {
  Condition,
  ConditionBuilder,
  ConditionType,
  getSessionPath,
  gql,
  HttpClient,
  RawValue,
  StructValue
} from '@kunlun/request';
import { useMatched } from '@kunlun/router';
import { isArray } from 'lodash-es';

const ModelMap = new Map<string, IModel>();

const ModelOnlyFieldsMap = new Map<string, IModel>();

enum EDirection {
  ASC = 'ASC',
  DESC = 'DESC'
}

interface ISort {
  sortField: string;
  direction: EDirection;
}

export const DEFAULT_LIST_TRUE_CONDITION = '(1==1) and (1==1)';

export const DEFAULT_TRUE_CONDITION = '1==1';

export const DEFAULT_FALSE_CONDITION = '1!=1';

/**
 * @deprecated 请使用{@link DEFAULT_TRUE_CONDITION}代替
 */
export const DEFAULT_CONDITION = DEFAULT_TRUE_CONDITION;

/**
 * 分页查询条件
 */
interface IQueryPageOption {
  pageSize?: number;
  currentPage?: number;
  // fixme @zbh 20220630 只允许使用数组，外层自行处理多字段排序
  sort?: ISort | ISort[];

  // fixme @zbh 20220630 移除
  condition?: Condition | string;
  // fixme @zbh 20220630 移除
  // condition 和 record 只能二选一
  record?: ObjectValue | ListValue;
  // FIXME: 未来查询方式改变后移除
  maxDepth?: number;
  queryData?: ObjectValue;
}

interface IQueryPageResult<T> {
  content: T[];
  totalElements: number;
  size: number;
  totalPages: number;
}

interface IBaseQueryPageResult<T> {
  content: T[];
  totalElements: string;
  size: string;
  totalPages: string;
}

interface RuntimeModel {
  model: string;
  modelFields: RuntimeModelField[];
}

type RuntimeModelField = IModelField;

interface RuntimeRelationField extends RuntimeModelField {
  referencesModel: RuntimeModel;
}

interface IMethod {
  name: string;
  argumentName: string;
}

type ObjectValue = { [key: string]: unknown };
type ListValue = ObjectValue[];

const http = HttpClient.getInstance();
const cb = ConditionBuilder.getInstance();

const viewActionRequestTtypes = [
  { name: 'model', ttype: ModelFieldType.String },
  { name: 'name', ttype: ModelFieldType.String },
  { name: 'resViewName', ttype: ModelFieldType.String },
  { name: 'viewType', ttype: ModelFieldType.Enum },
  { name: 'template', ttype: ModelFieldType.String },
  { name: 'needCompileView', ttype: ModelFieldType.Boolean },
  { name: 'needCompileMask', ttype: ModelFieldType.Boolean }
] as IModelField[];

const sharedViewActionRequestTtypes = [
  ...viewActionRequestTtypes,
  { name: 'sharedCode', ttype: ModelFieldType.String }
] as IModelField[];

// FIXME 该方法有一个缺陷，不兼容不想要任何响应字段的情况 v3版 请求字段和响应字段分离就不存在该问题了
const getFieldsToQuery = (fields: IModelField[] | undefined, model: IModel): IModelField[] => {
  return fields && fields.length ? fields : model.modelFields;
};

/**
 * 拼接查询时候的字段参数
 *
 * @param modelName 模型名称
 * @param fields 字段列表
 * @param depth 复杂结构的展开深度，当前是第几层
 * @param maxDepth 展开的最大深度
 * @param depthField 指定层级的字段, 一定查
 */
// TODO: 需要加入第二层、第三层的字段筛选查询
const formatQueryFields = async (
  modelName: string,
  fields: IModelField[],
  depth: number,
  maxDepth: number,
  depthField?
): Promise<string> => {
  const relatedFieldsMap = new Map();
  for (const field of fields) {
    if (field && field.ttype) {
      // fixme 后续此逻辑移到genModel中, setModel改造时一并改造
      if (field.ttype === ModelFieldType.Related && field.related && field.related.length > 1) {
        for (let i = 0; i < field.related.length - 1; i++) {
          const sourceFieldName = field.related?.[i];
          const sourceFieldNextLevelFieldName = field.related?.[i + 1];
          if (sourceFieldName && sourceFieldNextLevelFieldName) {
            const key = `${sourceFieldName}-${depth}`;
            let sourceFieldNextLevelFieldList = relatedFieldsMap.get(key);
            if (!sourceFieldNextLevelFieldList) {
              sourceFieldNextLevelFieldList = [];
            }
            sourceFieldNextLevelFieldList.push({
              ...field,
              name: sourceFieldNextLevelFieldName,
              ttype: field.relatedTtype
            });
            relatedFieldsMap.set(`${sourceFieldName}-${depth}`, sourceFieldNextLevelFieldList);
          }
        }
      }
    }
  }
  const fieldsQueryBuilders = fields
    .filter((_f) => _f && _f.ttype)
    .map((field) => formatQueryField(modelName, field, depth, maxDepth, relatedFieldsMap, depthField));

  const fieldsStrArr = await Promise.all(fieldsQueryBuilders);

  const result = fieldsStrArr.filter((str) => str !== '').join('\n');
  return result;
};

/**
 * 根据字段描述格式化查询中的参数写法
 *
 * @param modelModel 模型编码
 * @param field 字段描述
 * @param depth 复杂结构的展开深度，当前是第几层
 * @param maxDepth 展开的最大深度
 * @param relatedFieldsMap
 * @param depthField
 * @param relatedFieldsMap
 * @param depthField
 */
const formatQueryField = async (
  modelModel: string,
  field: IModelField,
  depth: number,
  maxDepth: number,
  relatedFieldsMap: Map<string, IModelField[]>,
  depthField?
): Promise<string> => {
  if (isSimpleField(field)) {
    return `${field.name}`;
  }
  switch (field.ttype) {
    case ModelFieldType.Related: {
      const { relatedTtype, ...fakeField } = field;
      return formatQueryField(modelModel, { ...fakeField, ttype: relatedTtype! }, depth, maxDepth, relatedFieldsMap);
    }
    case ModelFieldType.ManyToOne:
    case ModelFieldType.OneToOne:
    case ModelFieldType.OneToMany:
    case ModelFieldType.ManyToMany: {
      if (depth >= maxDepth && (!depthField || !depthField.names || !depthField.names.includes(field.name))) {
        return '';
      }
      // if (field.ttype !== ModelFieldType.ManyToOne && field.ttype !== ModelFieldType.OneToOne && depth >= maxDepth) {
      //   return '';
      // }
      const relatedModelName = field.references || (field as unknown as RuntimeRelationField).referencesModel?.model; // 复杂结构，这个就一定有值

      // 自关联的，不查
      if (relatedModelName === modelModel && field.ttype === ModelFieldType.OneToMany) {
        // return '';
      }

      // return `${field.name} {
      //   id
      // }`;
      const nextLevelFieldList = relatedFieldsMap.get(`${field.name}-${depth}`) as IModelField[];
      const nextLevelFieldNames: string[] = [];

      let subFields = field.modelFields ?? (field as unknown as RuntimeRelationField).referencesModel?.modelFields;
      if (!subFields || subFields.length === 0) {
        const relatedModel = await getModelByFields(relatedModelName);
        subFields = relatedModel.modelFields;
        if (nextLevelFieldList && nextLevelFieldList.length) {
          for (const nextLevelField of nextLevelFieldList) {
            nextLevelFieldNames.push(nextLevelField.name);
            const exist = subFields.findIndex((_f) => _f.name === nextLevelField.name);
            if (exist < 0) {
              subFields.push(nextLevelField);
            }
          }
        }
      }
      const relatedModelFieldsStr = await formatQueryFields(
        relatedModelName,
        subFields,
        depth + 1,
        maxDepth,
        nextLevelFieldNames.length > 0 ? { names: nextLevelFieldNames, depth } : undefined
      ); // TODO，以后可能要加筛选，不然很多
      if (relatedModelFieldsStr) {
        return `${field.name} {
          ${relatedModelFieldsStr}
        }`;
      }
      return '';
    }
    default: {
      return '';
    }
  }
};

const buildSingleItemParam = async (fields: IModelField[], item: ObjectValue): Promise<string> => {
  if (!item) {
    return '{}';
  }

  const builders = fields
    .filter((field) => item[field.name] !== undefined)
    .map((field) => formatFieldParam(field, item[field.name]));
  const params = await Promise.all(builders);

  return `{${params.join('\n')}}`;
};

const formatFieldParam = async (field: IModelField, value?): Promise<string> => {
  switch (field.ttype) {
    case ModelFieldType.Boolean: {
      const actualValue = value;
      if (field.multi) {
        return `${field.name}: [${actualValue}]`;
      }
      return `${field.name}: ${actualValue}`;
    }
    case ModelFieldType.Float:
    case ModelFieldType.Integer: {
      const actualValue = value;
      if (field.multi) {
        return `${field.name}: ${JSON.stringify(actualValue)}`;
      }
      return `${field.name}: ${actualValue}`;
    }
    case ModelFieldType.Long: {
      const actualValue = value;
      if (field.multi) {
        return `${field.name}: ${JSON.stringify(actualValue)}`;
      }
      return `${field.name}: "${actualValue}"`;
    }
    case ModelFieldType.Enum: {
      if (field.multi) {
        return `${field.name}: [${value}]`;
      }
      // 搜索过来的单值枚举值是多值的, 后端没跟上所以先传第一个
      if (isArray(value) && value.length > 0) {
        return `${field.name}: ${value[0]}`;
      }
      return `${field.name}: ${value}`;
    }
    // TODO: 先当简单字段传
    case ModelFieldType.Related: {
      const { relatedTtype, ...fakeField } = field;
      const str = await formatFieldParam({ ...fakeField, ttype: relatedTtype! }, value);
      return str;
    }
    case ModelFieldType.ID:
    case ModelFieldType.Date:
    case ModelFieldType.DateTime:
    case ModelFieldType.Year:
    case ModelFieldType.Time:
    case ModelFieldType.String:
    case ModelFieldType.Phone:
    case ModelFieldType.Email:
    case ModelFieldType.Text:
    case ModelFieldType.HTML: {
      const actualValue = value;
      return `${field.name}: ${JSON.stringify(actualValue)}`;
    }

    case ModelFieldType.Currency: {
      if (field.multi) {
        return `${field.name}: ${JSON.stringify(value)}`;
      }
      return `${field.name}:"${value}"`;
    }
    case ModelFieldType.OneToOne:
    case ModelFieldType.ManyToOne: {
      const actualValue = value as ObjectValue;

      let subFields = field.modelFields;
      if (!subFields || subFields.length === 0) {
        const model = await getModelByFields(field.references!);
        subFields = model.modelFields;
      }
      const paramStr = await buildSingleItemParam(subFields, actualValue);
      if (paramStr === '{}') {
        return '';
      }
      return `${field.name}: ${paramStr}`;
    }

    case ModelFieldType.Map: {
      const val = Object.keys(value || {}).map((key) => `"${key}": ${JSON.stringify(value[key])}`);
      const stringVal = JSON.stringify(`{${val.join(',')}}`);

      return `${field.name}: ${stringVal}`;
    }

    case ModelFieldType.OneToMany:
    case ModelFieldType.ManyToMany: {
      const actualValue = (value as ListValue) || [];
      let subFields = field.modelFields;
      if (!subFields || subFields.length === 0) {
        const model = await getModelByFields(field.references!);
        subFields = model.modelFields;
      }
      const builders = actualValue.map((val) => buildSingleItemParam(subFields, val));
      const paramArr = await Promise.all(builders);
      return `${field.name}: [${paramArr.join(',')}]`;
    }
    default: {
      console.warn(`暂未支持的ttype类型:${field.ttype}`);
      return '';
    }
  }
};

const queryModuleByName = async (name: string): Promise<IModule> => {
  const queryStr = gql`{
    moduleQuery {
      load(module: {name: "${name}"}) {
        homePage {
          ...ViewAction
        }
        id
        name
        module
        displayName
        application
        state
        priority
        logo
        allMenus {
          ...Menu
        }
      }
    }
  }
  ${MetadataFragment.Menu}
  `;
  const result = await http.query<IModule>(SYSTEM_MODULE_NAME.BASE, queryStr);
  return result.data.moduleQuery.load;
};

interface IQueryHomePageDslParam {
  needCompileView?: boolean;
  needCompileMask?: boolean;
  variables?: Entity;
  module?: string;
}

const queryHomePageDsl = async ({
  needCompileView = true,
  needCompileMask = true,
  module
}: IQueryHomePageDslParam): Promise<any> => {
  const variables: Record<string, any> = {};
  const moduleGqlStr = module ? `, module: "${module}"` : '';
  const gqlBody = gql`
    query {
      viewActionQuery {
        homepage(request: { needCompileView: ${needCompileView}, needCompileMask: ${needCompileMask} ${moduleGqlStr} }) {
          ${MetadataRuntimeFragmentName.ViewAction}
        }
      }
    }
    ${MetadataRuntimeFragment.ViewAction}
  `;
  const result = await http.query(SYSTEM_MODULE_NAME.BASE, gqlBody, variables);
  return result.data.viewActionQuery.homepage;
};

const queryMaskTemplate = async (
  model: string,
  actionName: string,
  needCompileView = true,
  needCompileMask = true
): Promise<any> => {
  const requestStr = await buildSingleItemParam(viewActionRequestTtypes, {
    model,
    name: actionName,
    needCompileView,
    needCompileMask
  });
  const queryStr = gql`
      query{
        viewActionQuery {
          load(request: ${requestStr}) {
            maskDefinition {
              name
              template
            }
          }
        }
      }
  `;

  const result = await http.query<IModule>(SYSTEM_MODULE_NAME.BASE, queryStr);
  return result.data.viewActionQuery.load;
};

const queryPageDslByModelAndNameBody = gql`
query (
  $model: String
  $name: String
  $needCompileView: Boolean = true
  $needCompileMask: Boolean = true
) {
  viewActionQuery {
    load(request: {
      model: $model
      name: $name
      needCompileView: $needCompileView
      needCompileMask: $needCompileMask
    } ) {
      ${MetadataRuntimeFragmentName.ViewAction}
    }
  }
}
${MetadataRuntimeFragment.ViewAction}
`;

const queryPageDslByModelAndName = async (
  model: string,
  name: string,
  needCompileView = true,
  needCompileMask = true
): Promise<IViewAction> => {
  const result = await http.query<IViewAction>(SYSTEM_MODULE_NAME.BASE, queryPageDslByModelAndNameBody, {
    model,
    name,
    needCompileView,
    needCompileMask
  });
  return result.data.viewActionQuery.load;
};

const queryPageDslBySharedCode = async (
  sharedCode: string,
  needCompileView = true,
  needCompileMask = true
): Promise<ISharedViewAction> => {
  const requestStr = await buildSingleItemParam(sharedViewActionRequestTtypes, {
    sharedCode,
    needCompileView,
    needCompileMask
  });
  const queryStr = gql`
      query{
        sharedPageQuery {
          load(page: ${requestStr} ) {
            ${MetadataRuntimeFragmentName.SharedViewAction}
          }
        }
      }
      ${MetadataRuntimeFragment.SharedViewAction}
  `;

  const result = await http.query<ISharedViewAction>(SYSTEM_MODULE_NAME.BASE, queryStr);
  return result.data.sharedPageQuery.load;
};

const queryViewDslByModelAndName = async (model: string, name: string) => {
  const requestStr = await buildSingleItemParam(viewActionRequestTtypes, {
    model,
    name
  });
  const request = gql`
    query {
      viewQuery {
        load(viewList: [${requestStr}]) {
          ${MetadataRuntimeFragmentName.View}
        }
      }
    }
    ${MetadataRuntimeFragment.View}
  `;
  const result = await http.query<IView>(SYSTEM_MODULE_NAME.BASE, request);
  return result.data.viewQuery.load?.[0];
};

const queryServerActionByModelAndName = async (model: string, name: string) => {
  const request = gql`
    query {
      serverActionQuery {
        load(request: {model: "${model}", name: "${name}"}) {
          ${MetadataRuntimeFragmentName.ServerAction}
        }
      }
    }
    ${MetadataRuntimeFragment.ServerAction}
  `;
  const result = await http.query<IAction>(SYSTEM_MODULE_NAME.BASE, request);
  return result.data.serverActionQuery.load;
};

const queryUrlActionByModelAndName = async (model: string, name: string) => {
  const request = gql`
    query {
      urlActionQuery {
        load(request: {model: "${model}", name: "${name}"}) {
          ${MetadataRuntimeFragmentName.UrlAction}
        }
      }
    }
    ${MetadataRuntimeFragment.UrlAction}
  `;
  const result = await http.query<IAction>(SYSTEM_MODULE_NAME.BASE, request);
  return result.data.urlActionQuery.load;
};

const queryViewDslByModelAndTemplate = async (model: string, template: string) => {
  const requestStr = await buildSingleItemParam(viewActionRequestTtypes, {
    model,
    template
  });
  const request = gql`
    query {
      viewQuery {
        load(viewList: [${requestStr}]) {
          ${MetadataRuntimeFragmentName.View}
        }
      }
    }
    ${MetadataRuntimeFragment.View}
  `;
  const result = await http.query<IView>(SYSTEM_MODULE_NAME.BASE, request);
  return result.data.viewQuery.load?.[0];
};

const loadModules = async (
  condition = BASE_RSQL_QUERY_CONDITION,
  pageSize = 10000,
  variables = {}
): Promise<IModule[]> => {
  const queryStr = gql`{
    moduleQuery {
      queryPage(queryWrapper: ${condition},page:{size:${pageSize}}) {
        content {
          homePage {
            ...ViewAction
          }
          id
          name
          module
          displayName
          application
          state
          priority
          logo
          category
        }
      }
    }
  }
  ${MetadataFragment.ViewAction}
  `;

  const rst = await http.query<{ content: IModule[] }>(SYSTEM_MODULE_NAME.BASE, queryStr, variables, { batch: true });
  return rst.data.moduleQuery.queryPage.content;
};

const getModel = async (modelModel: string, getByCache?: boolean): Promise<IModel> => {
  if (!modelModel) {
    throw new Error('no model name');
  }

  // let db;
  // if (!db) {
  //   db = createOioDB();
  //   await db.connectDB();
  // }

  if (getByCache !== false) {
    // const model = await db.query('model', modelModel);
    const model = ModelMap.get(modelModel);
    if (model) {
      // const data = deepClone(model);
      // registerAction(data);
      // return data;
      return model;
    }
  }

  const queryGql = gql`
    query ($modelModel: String) {
      modelQuery {
        load(modelDefinition: { model: $modelModel }) {
          ...Model
        }
      }
    }
    ${MetadataFragment.Model}
  `;
  // const result = await http.query<IModel>(SYSTEM_MODULE_NAME.BASE, queryGql, { modelModel }, { batch: true });
  const result = await http.query<IModel>(SYSTEM_MODULE_NAME.BASE, queryGql, { modelModel });

  const data = result.data.modelQuery.load;

  // await db.insert('model', data);
  ModelMap.set(modelModel, data);
  if (!data.pk) {
    data.pk = [];
  }
  return deepClone(data);
};

const getModelByFields = async (modelModel: string): Promise<IModel> => {
  if (!modelModel) {
    throw new Error('no model name');
  }
  const model = ModelOnlyFieldsMap.get(modelModel);
  if (model) {
    // const data = deepClone(model);
    // registerAction(data);
    // return data;
    return model;
  }
  const queryGql = gql`
    query ($modelModel: String) {
      modelQuery {
        loadModelField(modelDefinition: { model: $modelModel }) {
          ...ModelWithFields
        }
      }
    }
    ${MetadataFragment.ModelWithFields}
  `;
  const result = await http.query<IModel>(SYSTEM_MODULE_NAME.BASE, queryGql, { modelModel });
  const data = result.data.modelQuery.loadModelField;
  ModelOnlyFieldsMap.set(modelModel, data);
  if (!data.pk) {
    data.pk = [];
  }
  return deepClone(data);
};

/**
 * 分页类型接口查询方法
 * @param modelModel 模型编码
 * @param option 查询条件
 * @param fields 请求和响应字段配置，不传就取当前模型内的所有字段
 * @param variables 变量参数
 * @param context 上下文，其中的maxDepth属性表示查询的最大深度
 */
const queryPage = async <T = Record<string, unknown>>(
  modelModel: string,
  option: IQueryPageOption,
  fields?: IModelField[],
  variables?: ObjectValue,
  context: ObjectValue = {}
): Promise<IQueryPageResult<T>> => {
  return customQueryPage(modelModel, 'queryPage', option, fields, fields, variables, context);
};

/**
 * 自定义分页类型接口查询
 * @param modelModel 模型编码
 * @param methodName 方法名
 * @param option 查询条件
 * @param requestFields 请求的字段配置，不传就是解析record内的所有字段
 * @param responseFields 响应的字段配置，不传就是所有字段都返回
 * @param variables 变量参数
 * @param context 上下文，其中的maxDepth属性表示查询的最大深度
 */
const customQueryPage = async <T = Record<string, unknown>>(
  modelModel: string,
  methodName: string,
  option: IQueryPageOption,
  requestFields?: IModelField[],
  responseFields?: IModelField[],
  variables?: ObjectValue,
  context: ObjectValue = {}
): Promise<IQueryPageResult<T>> => {
  const { maxDepth = 0 } = context;
  const { matched } = useMatched();
  const scene = matched.segmentParams?.page?.scene;
  if (scene) {
    context = {
      ...context,
      __queryParams: {
        scene
      }
    };
  }

  const model = await getModelByFields(modelModel);
  requestFields = requestFields?.length ? requestFields : model.modelFields;
  responseFields = responseFields?.length ? responseFields : model.modelFields;
  const { condition = '', pageSize = 15, currentPage = 1, sort } = option;
  let queryData: string | undefined;
  let args;
  if (condition instanceof Condition) {
    const conditionBodyData = condition.getConditionBodyData();
    if (conditionBodyData && Object.keys(conditionBodyData).length) {
      queryData = await buildSingleItemParam(
        requestFields?.length ? requestFields : model.modelFields,
        conditionBodyData
      );
    }
    args = { rsql: condition.toString() };
    if (queryData) {
      args.queryData = new RawValue(queryData);
    }
  } else {
    args = { rsql: condition };
  }
  let param: ObjectValue | ObjectValue[] | string = cb.struct(args);
  if (option.record) {
    param = option.record;
  }
  let sorterCondition = '';

  /**
   * sort 支持单字段跟多字段排序
   * 单字段 {field : "name", direction: "ASC"}
   * 多字段排序[{field : "name", direction: "ASC"}, {field : "id", direction: "ASC"}]
   */
  if (sort) {
    if (Array.isArray(sort)) {
      if (sort.length) {
        const sortFields: string[] = [];
        sort.forEach((value) => {
          const { sortField, direction = `ASC` } = value;
          if (sortField) {
            sortFields.push(
              cb.struct({
                field: sortField,
                direction: cb.raw(direction)
              })
            );
          }
        });

        sorterCondition = `{orders: [${sortFields.join(',')}]}`;
      }
    } else {
      const { sortField, direction = `ASC` } = sort as ISort;
      if (sortField) {
        sorterCondition = cb.struct({
          orders: cb.raw(
            cb.struct({
              field: sortField,
              direction: cb.raw(direction)
            })
          )
        });
      }
    }
  }

  const basePageParams: Record<string, StructValue> = {
    currentPage,
    size: pageSize
  };

  if (sorterCondition) {
    basePageParams.sort = cb.raw(sorterCondition);
  }
  const responseBody = await formatQueryFields(modelModel, responseFields, 0, maxDepth as number);
  let paramStr = `page:${cb.struct(basePageParams)},`;
  if (typeof param === 'string') {
    paramStr += `queryWrapper: ${param}`;
  } else if (Array.isArray(param)) {
    const builders = (param as any[]).map((item) => buildSingleItemParam(requestFields!, item));
    const data = await Promise.all(builders);
    paramStr += `query: [${data.join(',')}]`;
  } else {
    const singleStr = await buildSingleItemParam(requestFields, param);
    paramStr += `query: ${singleStr}`;
  }
  const data = await http.commonQuery<IBaseQueryPageResult<T>>({
    module: model.moduleName,
    model: model.name,
    method: methodName,
    param: paramStr,
    variables,
    responseBody: `{
      content {
        ${responseBody}
      }
      size
      totalPages
      totalElements
    }`,
    context
  });

  const { content, totalElements, size, totalPages } = data;

  // this.cache.get(modelName).insertList(list);

  // TODO: 接入类型系统，根据元数据中的 size 判断字符串 or 数字
  return {
    content,
    totalElements: Number(totalElements),
    size: Number(size),
    totalPages: Number(totalPages)
  };
};

const customQueryPageWithModule = async <T = Record<string, unknown>>({
  modelModel,
  moduleName,
  modelName,
  methodName,
  option,
  requestFields,
  responseFields,
  variables,
  context
}: {
  modelModel: string;
  methodName: string;
  moduleName: string;
  modelName: string;
  option: IQueryPageOption;
  requestFields: IModelField[];
  responseFields: IModelField[];
  variables?: ObjectValue;
  context: ObjectValue;
}): Promise<IQueryPageResult<T>> => {
  const { maxDepth = 0 } = context;
  const { matched } = useMatched();
  const scene = matched.segmentParams?.page?.scene;
  if (scene) {
    context = {
      ...context,
      __queryParams: {
        scene
      }
    };
  }
  const { condition = '', pageSize = 15, currentPage = 1, sort } = option;
  let queryData: string | undefined;
  let args;
  if (condition instanceof Condition) {
    const conditionBodyData = condition.getConditionBodyData();
    if (conditionBodyData && Object.keys(conditionBodyData).length) {
      queryData = await buildSingleItemParam(requestFields, conditionBodyData);
    }
    args = { rsql: condition.toString() };
    if (queryData) {
      args.queryData = new RawValue(queryData);
    }
  } else {
    args = { rsql: condition };
  }
  let param: ObjectValue | ObjectValue[] | string = cb.struct(args);
  if (option.record) {
    param = option.record;
  }
  let sorterCondition = '';

  /**
   * sort 支持单字段跟多字段排序
   * 单字段 {field : "name", direction: "ASC"}
   * 多字段排序[{field : "name", direction: "ASC"}, {field : "id", direction: "ASC"}]
   */
  if (sort) {
    if (Array.isArray(sort)) {
      if (sort.length) {
        const sortFields: string[] = [];
        sort.forEach((value) => {
          const { sortField, direction = `ASC` } = value;
          if (sortField) {
            sortFields.push(
              cb.struct({
                field: sortField,
                direction: cb.raw(direction)
              })
            );
          }
        });

        sorterCondition = `{orders: [${sortFields.join(',')}]}`;
      }
    } else {
      const { sortField, direction = `ASC` } = sort as ISort;
      if (sortField) {
        sorterCondition = cb.struct({
          orders: cb.raw(
            cb.struct({
              field: sortField,
              direction: cb.raw(direction)
            })
          )
        });
      }
    }
  }

  const basePageParams: Record<string, StructValue> = {
    currentPage,
    size: pageSize
  };

  if (sorterCondition) {
    basePageParams.sort = cb.raw(sorterCondition);
  }
  const responseBody = await formatQueryFields(modelModel, responseFields, 0, maxDepth as number);
  let paramStr = `page:${cb.struct(basePageParams)},`;
  if (typeof param === 'string') {
    paramStr += `queryWrapper: ${param}`;
  } else if (Array.isArray(param)) {
    const builders = (param as any[]).map((item) => buildSingleItemParam(requestFields!, item));
    const data = await Promise.all(builders);
    paramStr += `query: [${data.join(',')}]`;
  } else {
    const singleStr = await buildSingleItemParam(requestFields, param);
    paramStr += `query: ${singleStr}`;
  }
  const data = await http.commonQuery<IBaseQueryPageResult<T>>({
    module: moduleName,
    model: modelName,
    method: methodName,
    param: paramStr,
    variables,
    responseBody: `{
      content {
        ${responseBody}
      }
      size
      totalPages
      totalElements
    }`,
    context
  });

  const { content, totalElements, size, totalPages } = data;

  // this.cache.get(modelName).insertList(list);

  // TODO: 接入类型系统，根据元数据中的 size 判断字符串 or 数字
  return {
    content,
    totalElements: Number(totalElements),
    size: Number(size),
    totalPages: Number(totalPages)
  };
};

const queryOne = async (
  modelName: string,
  params: { [props: string]: StructValue },
  fields?: IModelField[],
  variables?: ObjectValue,
  context: ObjectValue = {},
  model?: IModel
): Promise<any> => {
  const { maxDepth = 0 } = context;
  const { matched } = useMatched();
  const scene = matched.segmentParams?.page?.scene;
  if (scene) {
    context = {
      ...context,
      __queryParams: {
        scene
      }
    };
  }
  const $model = model || (await getModelByFields(modelName));
  const fieldsToQuery = getFieldsToQuery(fields, $model);
  // const param = cb.struct(params);
  const param = await buildSingleItemParam($model.modelFields, params);
  // FIXME: param 为 {} 的话，后端会返回奇怪的数据，暂时先这样
  if (param === '{}') {
    return {};
  }
  const responseBody = await formatQueryFields(modelName, fieldsToQuery, 0, maxDepth as number);
  if (responseBody === '') {
    return {};
  }
  const data = await http.commonQuery<any>({
    module: $model.moduleName,
    model: $model.name,
    method: 'queryOne',
    param: `query: ${param}`,
    variables,
    responseBody: `{${responseBody}}`,
    context
  });

  // this.cache.get(modelName).insertOrUpdateOne(data);

  return data;
};

const queryOneByWrapper = async (
  modelName: string,
  rsql: string,
  fields?: IModelField[],
  variables?: ObjectValue,
  context: ObjectValue = {}
): Promise<any> => {
  const { maxDepth = 0 } = context;
  const { matched } = useMatched();
  const scene = matched.segmentParams?.page?.scene;
  if (scene) {
    context = {
      ...context,
      __queryParams: {
        scene
      }
    };
  }
  const model = await getModelByFields(modelName);
  const fieldsToQuery = getFieldsToQuery(fields, model);
  const responseBody = await formatQueryFields(modelName, fieldsToQuery, 0, maxDepth as number);
  if (responseBody === '') {
    return {};
  }
  const data = await http.commonQuery<any>({
    module: model.moduleName,
    model: model.name,
    method: 'queryOneByWrapper',
    param: `queryWrapper: { rsql: "${rsql}" }`,
    variables,
    responseBody: `{${responseBody}}`,
    context
  });
  return data;
};

const constructMirror = async <T>(
  modelModel: string,
  record: ObjectValue | ListValue | string = {},
  fields?: IModelField[],
  variables?: ObjectValue,
  context: ObjectValue = {}
): Promise<T> => {
  return customQuery(modelModel, 'constructMirror', record, fields, fields, variables, context);
};

/**
 * 自定义查询
 * @param modelModel 模型编码
 * @param method 方法名
 * @param record 请求参数，可以是单体对象或者对象的列表
 * @param requestFields 请求的字段配置，不传就是解析record内的所有字段
 * @param responseFields 响应的字段配置，不传就是所有字段都返回
 * @param variables 变量参数
 * @param context 上下文，其中的maxDepth属性表示查询的最大深度
 */
const customQuery = async <T>(
  modelModel: string,
  method: string | IMethod,
  record: ObjectValue | ListValue | string = {},
  requestFields?: IModelField[],
  responseFields?: IModelField[],
  variables?: ObjectValue,
  context: ObjectValue = {}
): Promise<T> => {
  const { matched } = useMatched();
  const scene = matched.segmentParams?.page?.scene;
  if (scene) {
    context = {
      ...context,
      __queryParams: {
        scene
      }
    };
  }

  if (typeof method === 'string') {
    method = {
      name: method,
      argumentName: 'data'
    } as IMethod;
  }

  const { maxDepth = 1 } = context;
  const model = await getModelByFields(modelModel);
  requestFields = requestFields && requestFields.length ? requestFields : model.modelFields;
  responseFields = responseFields && responseFields.length ? responseFields : model.modelFields;
  const responseBody = await formatQueryFields(modelModel, responseFields, 0, maxDepth as number);
  let param = '{}';
  if (typeof record === 'string') {
    param = record;
  } else if (Array.isArray(record)) {
    const builders = record.map((item) => buildSingleItemParam(requestFields!, item));
    const data = await Promise.all(builders);
    param = `[${data.join(',')}]`;
  } else {
    param = await buildSingleItemParam(requestFields, record);
  }

  const data = await http.commonQuery<T>({
    module: model.moduleName,
    model: model.name,
    method: method.name,
    param: `${method.argumentName}: ${param}`,
    variables,
    responseBody: `{${responseBody}}`,
    context
  });
  return data;
};
/**
 * @param  {modelModel: string} 模型编码
 * @param  {model:IModel} model 模型
 * @param  {record: ObjectValue | ListValue | string} 参数
 * @param  {fields?: IModelField[]} 模型字段
 * @param  {variables} variables
 * @param  {context} context
 *
 * @returns Promise<T>
 */
const constructOne = async <T>({
  modelModel,
  model,
  record = {},
  fields,
  variables,
  context = {}
}: {
  modelModel: string;
  model: IModel;
  record: ObjectValue | ListValue | string;
  fields?: IModelField[];
  variables?: ObjectValue;
  context: ObjectValue;
}): Promise<T> => {
  const queryGql = gql`
    query {
      functionQuery {
        queryOne(query: { namespace: "${modelModel}", fun: "construct" }) {
          ...Func
        }
      }
    }
    ${MetadataFragment.Func}
  `;

  const result = await http.query<{ argumentList: { name: string; model: string }[]; name: string }>(
    SYSTEM_MODULE_NAME.BASE,
    queryGql
  );
  const func = result.data.functionQuery.queryOne;
  const { maxDepth = 1 } = context;
  const sourceModelModel = context.sourceModel;
  const { matched } = useMatched();
  const scene = matched.segmentParams?.page?.scene;
  if (scene) {
    context = {
      ...context,
      __queryParams: {
        scene
      }
    };
  }

  let modelFields;
  if (!fields) {
    const $model = await getModelByFields(model.model);
    modelFields = $model.modelFields;
  }

  let sourceModel = model;
  if (sourceModelModel) {
    sourceModel = await getModelByFields(sourceModelModel as string);
  }

  const sourceFieldsToQuery = sourceModel.modelFields;
  const fieldsToQuery = fields || modelFields;
  const responseBody = await formatQueryFields(model.model, fieldsToQuery, 0, maxDepth as number);
  let param = '{}';
  if (typeof record === 'string') {
    param = record;
  } else if (Array.isArray(record)) {
    const funArg1 = func.argumentList[1];
    if (funArg1) {
      const funArg1Model = await getModelByFields(funArg1.model);
      const builders = record.map((item) => {
        return buildSingleItemParam(funArg1Model.modelFields, item);
      });
      const data = await Promise.all(builders);
      param = `[${data.join(',')}]`;
    } else {
      const builders = record.map((item) => {
        const reqData = {};
        modelFields.forEach((field) => {
          const findOne = sourceModel.modelFields.find((item1) => item1.name === field.name);
          if (findOne) {
            reqData[findOne.name] = item[findOne.name];
          }
        });
        return buildSingleItemParam(sourceFieldsToQuery, reqData);
      });
      const data = await Promise.all(builders);
      param = `[${data.join(',')}]`;
    }
  } else if (func.argumentList) {
    const reqData = {};
    if (func.argumentList[1]) {
      for (const key in record) {
        reqData[key] = record[key];
      }
    } else {
      let argModel;
      const argModelModel = func.argumentList[0].model;
      if (argModelModel === modelModel) {
        argModel = model;
      } else {
        argModel = await getModelByFields(argModelModel);
      }
      argModel.modelFields.forEach((field) => {
        const findOne = sourceModel.modelFields.find((item1) => item1.name === field.name);
        if (findOne) {
          reqData[findOne.name] = record[findOne.name];
        }
      });
    }
    param = await buildSingleItemParam(sourceFieldsToQuery, reqData);
  }
  const arg0 = func.argumentList ? func.argumentList[0] : '';
  const arg1 = func.argumentList ? func.argumentList[1] : '';

  let paramStr = 'data: {}';
  if (arg1 && arg1.name) {
    paramStr = `
    ${arg1.name}: ${param}
    `;
  } else if (arg0 && arg0.name) {
    paramStr = `
    ${arg0.name}: ${param}
    `;
  }

  const data = await http.commonQuery<T>({
    module: model.moduleName,
    model: model.name,
    method: func.name,
    param: paramStr,
    variables,
    responseBody: `{${responseBody}}`,
    context
  });
  return data;
};

const queryReferences = async <T>(
  field: IModelField,
  mainQueryData: { [props: string]: ConditionType },
  fields?: IModelField[],
  variables?: ObjectValue,
  context: ObjectValue = {}
): Promise<IQueryPageResult<T>> => {
  const { references, referenceFields, relationFields, domainSize, relationStore } = field;
  if (!relationStore) {
    return {
      content: [],
      totalElements: 0,
      size: 0,
      totalPages: 0
    };
  }
  if (!references || !referenceFields || !relationFields) {
    throw new Error('没有references || referenceFields || relationFields');
  }
  // const model = await getModel(references);
  let condition!: Condition;
  for (let i = 0; i < referenceFields.length; i++) {
    const c = cb.condition(referenceFields[i]).equal(mainQueryData[relationFields[i]]);
    if (!condition) {
      condition = c;
    } else {
      condition = condition.and(c);
    }
  }
  const queryData = {
    condition: condition.toString(),
    pageSize: domainSize ? Number(domainSize) : undefined
  };
  const data = await queryPage<T>(references, queryData, fields, variables, context);
  return data;
};

/**
 * 调用serverAction的function
 * @param modelModel
 * @param action
 * @param params
 * @param requestFields
 * @param variables
 * @param context
 */
const callFunction = async <T>(
  modelModel: string,
  action: IServerAction,
  params: ObjectValue | ListValue,
  requestFields?: IModelField[],
  variables?: ObjectValue,
  context: ObjectValue = {}
): Promise<T> => {
  return requestMutation<T>(modelModel, action, params, requestFields, undefined, variables, context);
};

/**
 * 直接调用function
 * @param modelModel
 * @param fun
 * @param params
 * @param requestFields
 * @param responseFields
 * @param responseFields
 * @param variables
 * @param context
 */
const callFun = async <T>(
  modelModel: string,
  fun: IModelFunc,
  params: ObjectValue | ListValue,
  requestFields?: IModelField[],
  responseFields?: IModelField[],
  variables?: ObjectValue,
  context: ObjectValue = {}
): Promise<T> => {
  const { maxDepth = 0, argumentName } = context;
  const { matched } = useMatched();
  const scene = matched.segmentParams?.page?.scene;
  if (scene) {
    context = {
      ...context,
      __queryParams: {
        scene
      }
    };
  }
  const model = await getModelByFields(modelModel);
  requestFields = requestFields && requestFields.length ? requestFields : model.modelFields;
  responseFields = responseFields && responseFields.length ? requestFields : model.modelFields;
  let paramStr = '{}';
  if (Array.isArray(params)) {
    const builders = params.map((item) => buildSingleItemParam(requestFields!, item));
    const data = await Promise.all(builders);
    paramStr = `[${data.join(',')}]`;
  } else {
    paramStr = await buildSingleItemParam(requestFields, params);
  }
  const responseBody = await formatQueryFields(modelModel, responseFields, 0, maxDepth as number);

  const arg0 = fun.argumentList[0];
  const methodName = fun.name;
  const { type } = fun;

  const commonParams = {
    module: model.moduleName,
    model: model.name,
    method: methodName,
    param: `${argumentName || arg0.name}: ${paramStr}`,
    variables,
    responseBody: `{${responseBody}}`,
    context
  };

  let data;
  if (type?.includes('QUERY')) {
    data = await http.commonQuery<T>(commonParams);
  } else {
    data = await http.commonMutate<T>(commonParams);
  }

  return data;
};

const requestMutation = async <T>(
  modelModel: string,
  action: IServerAction,
  params: ObjectValue | ListValue,
  requestFields?: IModelField[],
  responseFields?: IModelField[],
  variables?: ObjectValue,
  context: ObjectValue = {}
): Promise<T> => {
  let { sessionPath } = action;
  if (!sessionPath) {
    sessionPath = getSessionPath();
  }
  if (!variables) {
    variables = {};
  }
  if (!variables.path && sessionPath) {
    variables.path = sessionPath;
  }
  return callFun(
    modelModel,
    action.functionDefinition || action.function,
    params,
    requestFields,
    responseFields,
    variables,
    context
  );
};

const updateOne = async (
  modelModel: string,
  record: ObjectValue,
  fields?: IModelField[],
  variables?: ObjectValue,
  context: ObjectValue = {}
): Promise<any> => {
  return customMutation(modelModel, 'update', record, fields, undefined, variables, context);
};

const updateBatch = async (
  modelModel: string,
  record: ListValue,
  fields?: IModelField[],
  variables?: ObjectValue,
  context: ObjectValue = {}
): Promise<any> => {
  return customMutation(
    modelModel,
    { name: 'updateWithFieldBatch', argumentName: 'dataList' },
    record,
    fields,
    undefined,
    variables,
    context
  );
};

/**
 * 自定义请求方法
 * @param modelModel 模型编码
 * @param method 方法名或方法对象
 * @param records 请求参数，可以是单体对象或者对象的列表
 * @param requestFields 请求的字段配置，不传就是解析record内的所有字段
 * @param responseFields 响应的字段配置，不传就是所有字段都返回
 * @param variables 变量参数
 * @param context 上下文，其中的maxDepth属性表示查询的最大深度
 */
const customMutation = async (
  modelModel: string,
  method: string | IMethod,
  records: ObjectValue | ListValue,
  requestFields?: IModelField[],
  responseFields?: IModelField[],
  variables?: ObjectValue,
  context: ObjectValue = {}
): Promise<any> => {
  const { maxDepth = 1 } = context;
  const { matched } = useMatched();
  const scene = matched.segmentParams?.page?.scene;
  if (scene) {
    context = {
      ...context,
      __queryParams: {
        scene
      }
    };
  }
  if (typeof method === 'string') {
    method = {
      name: method,
      argumentName: 'data'
    } as IMethod;
  }
  const model = await getModelByFields(modelModel);
  requestFields = requestFields?.length ? requestFields : model.modelFields;
  responseFields = responseFields?.length ? responseFields : model.modelFields;
  let param;
  if (Array.isArray(records)) {
    param = `[${(await Promise.all(records.map((record) => buildSingleItemParam(requestFields!, record)))).join(',')}]`;
  } else {
    param = await buildSingleItemParam(requestFields, records);
  }
  const responseBody = await formatQueryFields(modelModel, responseFields, 0, maxDepth as number);
  const data = await http.commonMutate<any>({
    module: model.moduleName,
    model: model.name,
    method: method.name,
    param: `${method.argumentName}: ${param}`,
    variables,
    responseBody: `{${responseBody}}`,
    context
  });

  return data;
};
const insertOne = async (
  modelModel: string,
  record: ObjectValue,
  fields?: IModelField[],
  variables?: ObjectValue,
  context: ObjectValue = {}
): Promise<any> => {
  return customMutation(modelModel, 'create', record, fields, undefined, variables, context);
};

const deleteOne = async (
  modelModel: string,
  record: Entity,
  variables?: ObjectValue,
  context: ObjectValue = {}
): Promise<any> => {
  const { maxDepth = 1 } = context;
  const { matched } = useMatched();
  const scene = matched.segmentParams?.page?.scene;
  if (scene) {
    context = {
      ...context,
      __queryParams: {
        scene
      }
    };
  }
  const model = await getModelByFields(modelModel);
  const fieldsToQuery = model.modelFields;
  const responseBody = await formatQueryFields(modelModel, fieldsToQuery, 0, maxDepth as number);
  const param = await buildSingleItemParam(fieldsToQuery, record);
  const data = await http.commonMutate<any>({
    module: model.moduleName,
    model: model.name,
    method: 'delete',
    param: `dataList: [${param}]`,
    variables,
    responseBody: `{${responseBody}}`,
    context
  });

  // this.cache.get(modelModel).deleteOne(record);

  return data;
};
const cleanModelCache = () => {
  ModelMap.clear();
  ModelOnlyFieldsMap.clear();
};

export {
  queryModuleByName,
  getModel,
  getModelByFields,
  customQueryPage,
  queryPage,
  queryOne,
  queryOneByWrapper,
  constructOne,
  constructMirror,
  customQuery,
  customMutation,
  updateOne,
  updateBatch,
  insertOne,
  deleteOne,
  callFunction,
  callFun,
  requestMutation,
  queryReferences,
  loadModules,
  IQueryPageOption,
  IQueryPageResult,
  EDirection,
  ISort,
  http,
  cleanModelCache,
  buildSingleItemParam,
  // v3
  queryMaskTemplate,
  queryPageDslByModelAndName,
  queryPageDslBySharedCode,
  queryViewDslByModelAndName,
  queryViewDslByModelAndTemplate,
  queryServerActionByModelAndName,
  queryUrlActionByModelAndName,
  IQueryHomePageDslParam,
  queryHomePageDsl,
  customQueryPageWithModule
};
