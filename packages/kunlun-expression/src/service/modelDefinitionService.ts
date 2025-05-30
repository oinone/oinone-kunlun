import { useMatched } from '@kunlun/router';
import { Condition, HttpClient } from '@kunlun/request';
import { Pagination } from '@kunlun/engine';
import dayjs from 'dayjs';
import { SYSTEM_MODULE_NAME } from '@kunlun/meta';

const http = HttpClient.getInstance();
const DEFAULT_SORTS_STR = `{orders: [{field: "priority", direction: ASC}, {field: "writeDate", direction: DESC}]}`;

export async function queryExpModelPage(
  methodName: string,
  responseFields: string[],
  condition = '',
  pagination: Pagination,
  isFetchModelFields = true
) {
  const { matched } = useMatched();

  const modelFieldsGql = !isFetchModelFields
    ? ''
    : `
  modelFields {
    name
    displayName
    ttype
    model
    through
    references
    referenceFields
    relationFields
    multi
    store
    relationStore
    storeSerialize
    field
    show
    systemSource
    priority
    writeDate
  }
  `;
  const body = `{
    modelDefinitionQuery {
      ${methodName}(page: {size: ${pagination.pageSize}, currentPage: ${pagination.current}}, queryWrapper: {rsql: "${condition}"}) {
        content {
          id
          model
          displayName
          name
          summary
          ${modelFieldsGql}
        }
      }
    }
  }
  `;

  const result = (await http.query(SYSTEM_MODULE_NAME.BASE, body, {
    currentModule: matched?.segmentParams.page.module
  })) as any;
  const pageResult = result.data.modelDefinitionQuery.queryPage;
  if (pageResult && pageResult.content) {
    pageResult.content.forEach((model) => {
      model.modelFields =
        model.modelFields?.sort((a, b) => {
          const res = parseInt(a.priority || '10000') - parseInt(b.priority || '10000');
          if (res !== 0) {
            return res;
          }
          return dayjs(a.writeDate).unix() - dayjs(b.writeDate).unix();
        }) || [];
    });
  }
  return pageResult;
}

/**
 * 查询模型字段
 *
 * @param {string} modelModel 模型编码
 */
export const queryExpModelFields = async (modelModel: string) => {
  if (!modelModel) {
    return [];
  }
  const queryName = 'fieldQuery';
  const queryMethod = 'queryPage';
  const condition = new Condition('model').equal(modelModel);
  const body = `{
    ${queryName} {
      ${queryMethod}(page: {size: 500, sort:${DEFAULT_SORTS_STR}}, queryWrapper: {rsql: "${condition.toString()}"}) {
        content {
          name
          displayName
          ttype
          #model
          multi
          references
          size
          related
          relatedTtype
          store
          relationStore
          storeSerialize
          relationFields
          referenceFields
          throughRelationFields
          throughReferenceFields
          through
          dictionary
          format
          options {
            name
            displayName
            value
          }
          column
          field
          pk
          priority
          index
          bitOptions
          show
          systemSource
          unique
        }
      }
    }
  }
  `;

  const result = (await http.query(SYSTEM_MODULE_NAME.BASE, body)) as any;
  return result.data[queryName][queryMethod].content;
};

/**
 * 查询模型的枚举类型字段
 *
 * @param {string} modelModel 模型编码
 * @param {string} fieldName 字段名称
 */
export async function expFetchFieldSimpleInfo(modelModel, fieldName) {
  if (!modelModel) {
    return null;
  }
  const queryName = 'fieldQuery';
  const queryMethod = 'queryOne';
  const body = `
     query{
        ${queryName} {
            ${queryMethod}(query: { model: "${modelModel}", name: "${fieldName}" }){
                id
                name
                options{
                    name
                    value
                    displayName
                }
            }
    }
}
  `;

  const result = (await http.query(SYSTEM_MODULE_NAME.BASE, body)) as any;
  return result.data[queryName][queryMethod];
}
